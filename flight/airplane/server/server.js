// server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const FLIGHTS_FILE = path.join(DATA_DIR, 'flights.json');
const PASSENGERS_FILE = path.join(DATA_DIR, 'passengers.json');

// Serve static frontend from new folders (html as root, plus css/js/images)
const HTML_DIR = path.join(__dirname, '..', 'html');
const CSS_DIR = path.join(__dirname, '..', 'css');
const JS_DIR = path.join(__dirname, '..', 'js');
const IMAGES_DIR = path.join(__dirname, '..', 'images');

// Mount asset directories BEFORE the root HTML static to avoid Express 5 static 404 short-circuit
app.use('/css', express.static(CSS_DIR));
app.use('/js', express.static(JS_DIR));
app.use('/images', express.static(IMAGES_DIR));
app.use(express.static(HTML_DIR, { index: false }));

// helper: read JSON file
async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

// helper: write JSON file
async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/flights  (supports optional ?origin=&destination=&date=)
app.get('/api/flights', async (req, res) => {
  try {
    const flights = await readJson(FLIGHTS_FILE);
    const { origin, destination, date } = req.query;
    let filtered = flights;

    if (origin) filtered = filtered.filter(f => f.origin.toLowerCase().includes(origin.toLowerCase()));
    if (destination) filtered = filtered.filter(f => f.destination.toLowerCase().includes(destination.toLowerCase()));
    if (date) filtered = filtered.filter(f => f.date === date);

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load flights' });
  }
});

// GET /api/flights/:id
app.get('/api/flights/:id', async (req, res) => {
  try {
    const flights = await readJson(FLIGHTS_FILE);
    const flight = flights.find(f => f.id === req.params.id);
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    res.json(flight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load flight' });
  }
});

// GET /api/bookings/:bookingId
app.get('/api/bookings/:bookingId', async (req, res) => {
  try {
    const bookings = await readJson(PASSENGERS_FILE);
    const booking = bookings.find(b => b.bookingId === req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load booking' });
  }
});

// POST /api/bookings  -> create booking (passenger data from form)
app.post('/api/bookings', async (req, res) => {
  try {
    const { flightId, passenger } = req.body;
    if (!flightId || !passenger) return res.status(400).json({ error: 'flightId and passenger required' });

    // read flights to validate flightId exists
    const flights = await readJson(FLIGHTS_FILE);
    const flight = flights.find(f => f.id === flightId);
    if (!flight) return res.status(400).json({ error: 'Invalid flightId' });

    // read or create passengers array
    let bookings;
    try {
      bookings = await readJson(PASSENGERS_FILE);
      if (!Array.isArray(bookings)) bookings = [];
    } catch (e) {
      bookings = [];
    }

    // generate bookingId
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const bookingId = `BK${timestamp}${Math.floor(Math.random() * 900 + 100)}`;

    const newBooking = {
      bookingId,
      flightId,
      passenger,
      seat: null,
      paymentStatus: 'pending',
      bookingDateTime: new Date().toISOString()
    };

    bookings.push(newBooking);
    await writeJson(PASSENGERS_FILE, bookings);

    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// POST /api/bookings/:bookingId/seat  -> reserve seat and update flight seats
app.post('/api/bookings/:bookingId/seat', async (req, res) => {
  try {
    const { seat } = req.body;
    if (!seat) return res.status(400).json({ error: 'seat required' });

    const bookings = await readJson(PASSENGERS_FILE);
    const bookingIndex = bookings.findIndex(b => b.bookingId === req.params.bookingId);
    if (bookingIndex === -1) return res.status(404).json({ error: 'Booking not found' });

    const booking = bookings[bookingIndex];

    // load flights
    const flights = await readJson(FLIGHTS_FILE);
    const flightIndex = flights.findIndex(f => f.id === booking.flightId);
    if (flightIndex === -1) return res.status(404).json({ error: 'Flight not found' });

    const flight = flights[flightIndex];

    if (!flight.seats || !(seat in flight.seats)) {
      return res.status(400).json({ error: 'Invalid seat' });
    }

    if (!flight.seats[seat]) {
      return res.status(409).json({ error: 'Seat already taken' });
    }

    // reserve seat: set team: false (occupied)
    flight.seats[seat] = false;
    // update booking
    bookings[bookingIndex].seat = seat;

    // write both files
    flights[flightIndex] = flight;
    await writeJson(FLIGHTS_FILE, flights);
    await writeJson(PASSENGERS_FILE, bookings);

    res.json(bookings[bookingIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reserve seat' });
  }
});

// POST /api/bookings/:bookingId/payment -> mark payment confirmed
app.post('/api/bookings/:bookingId/payment', async (req, res) => {
  try {
    const bookings = await readJson(PASSENGERS_FILE);
    const idx = bookings.findIndex(b => b.bookingId === req.params.bookingId);
    if (idx === -1) return res.status(404).json({ error: 'Booking not found' });

    bookings[idx].paymentStatus = 'confirmed';
    await writeJson(PASSENGERS_FILE, bookings);
    res.json(bookings[idx]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Root route: serve Homepage.html
app.get('/', (req, res) => {
  res.sendFile(path.join(HTML_DIR, 'Homepage.html'));
});

app.get('/index.html', (req, res) => {
  res.redirect(302, '/Homepage.html');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
