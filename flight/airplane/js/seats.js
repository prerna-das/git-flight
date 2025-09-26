// public/js/seats.js
async function getParams() {
  return new URLSearchParams(window.location.search);
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = await getParams();
  const bookingId = params.get('bookingId');
  const flightId = params.get('flightId');
  const bookingSummary = document.getElementById('bookingSummary');
  const seatMapEl = document.getElementById('seatMap');
  const confirmBtn = document.getElementById('confirmSeatBtn');

  if (!bookingId || !flightId) {
    bookingSummary.innerHTML = '<div class="small">Missing booking or flight information.</div>';
    return;
  }

  try {
    // fetch flight and booking
    const [flightResp, bookingResp] = await Promise.all([
      fetch(`/api/flights/${encodeURIComponent(flightId)}`),
      fetch(`/api/bookings/${encodeURIComponent(bookingId)}`)
    ]);
    if (!flightResp.ok) throw new Error('Flight not found');
    if (!bookingResp.ok) throw new Error('Booking not found');

    const flight = await flightResp.json();
    const booking = await bookingResp.json();

    bookingSummary.innerHTML = `
      <div class="flight-row">
        <div>
          <div class="flight-title">${flight.flightName} <span class="small">(${flight.flightNumber})</span></div>
          <div class="small">${flight.origin} → ${flight.destination} • ${flight.date}</div>
          <div class="small">Passenger: ${booking.passenger.name} • ₹${flight.price}</div>
        </div>
      </div>
    `;

    // render seats
    const seats = flight.seats || {};
    const seatKeys = Object.keys(seats);

    // sort seatKeys (A1, A2...)
    seatKeys.sort((a,b) => {
      const rowA = a.charCodeAt(0), rowB = b.charCodeAt(0);
      const numA = parseInt(a.slice(1)), numB = parseInt(b.slice(1));
      if (rowA !== rowB) return rowA - rowB;
      return numA - numB;
    });

    seatMapEl.innerHTML = '';
    let selectedSeat = null;

    seatKeys.forEach(key => {
      const btn = document.createElement('div');
      btn.className = 'seat' + (seats[key] ? '' : ' taken');
      btn.textContent = key;
      if (seats[key]) {
        btn.addEventListener('click', () => {
          // toggle selection
          document.querySelectorAll('.seat.selected').forEach(el => el.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSeat = key;
          confirmBtn.disabled = false;
        });
      }
      seatMapEl.appendChild(btn);
    });

    confirmBtn.addEventListener('click', async () => {
      if (!selectedSeat) {
        alert('Select a seat first');
        return;
      }

      const originalLabel = confirmBtn.textContent;
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Reserving seat...';

      try {
        const resp = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/seat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seat: selectedSeat })
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: 'Failed to reserve seat' }));
          throw new Error(err.error || `Seat reservation failed (${resp.status})`);
        }

        window.location.href = `/pay.html?bookingId=${encodeURIComponent(bookingId)}`;
      } catch (err) {
        console.error(err);
        alert(err.message || 'Seat reservation failed. Please try another seat.');
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalLabel;
      }
    });

  } catch (err) {
    console.error(err);
    bookingSummary.innerHTML = '<div class="small">Failed to load booking/flight data.</div>';
  }
});
