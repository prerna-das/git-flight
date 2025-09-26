// public/js/booking.js
async function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener('DOMContentLoaded', async () => {
  const flightId = await getQueryParam('flightId');
  const flightSummary = document.getElementById('flightSummary');
  const form = document.getElementById('passengerForm');

  if (!flightId) {
    flightSummary.innerHTML = '<div class="small">No flight selected. Go back and choose a flight.</div>';
    form.style.display = 'none';
    return;
  }

  // fetch flight details
  try {
    const resp = await fetch(`/api/flights/${encodeURIComponent(flightId)}`);
    if (!resp.ok) throw new Error('Flight not found');
    const flight = await resp.json();
    flightSummary.innerHTML = `
      <div class="flight-row">
        <div>
          <div class="flight-title">${flight.flightName} <span class="small">(${flight.flightNumber})</span></div>
          <div class="small">${flight.origin} → ${flight.destination} • ${flight.date}</div>
          <div class="small">Departs: ${flight.departureTime} • Arrives: ${flight.arrivalTime}</div>
        </div>
        <div class="center">
          <div class="badge">₹ ${flight.price}</div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    flightSummary.innerHTML = '<div class="small">Failed to load flight details.</div>';
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const passenger = {
      name: document.getElementById('name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      age: Number(document.getElementById('age').value),
      aadhar: document.getElementById('aadhar').value.trim(),
      gender: document.getElementById('gender').value,
      dob: document.getElementById('dob').value,
      address: document.getElementById('address').value.trim()
    };

    // basic validations
    if (!/^\d{10}$/.test(passenger.phone)) return alert('Phone must be 10 digits');
    if (!/^\d{12}$/.test(passenger.aadhar)) return alert('Aadhar must be 12 digits');
    if (!/^\S+@\S+\.\S+$/.test(passenger.email)) return alert('Enter a valid email');

    try {
      const resp = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId, passenger })
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Booking failed');
      }
      const booking = await resp.json();
      // redirect to seat selection
      window.location.href = `seats.html?bookingId=${encodeURIComponent(booking.bookingId)}&flightId=${encodeURIComponent(flightId)}`;
    } catch (err) {
      console.error(err);
      alert('Failed to create booking: ' + err.message);
    }
  });
});
