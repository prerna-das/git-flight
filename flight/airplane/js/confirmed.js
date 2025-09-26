// public/js/confirmed.js
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('bookingId');
  const container = document.getElementById('confirmed');

  if (!bookingId) {
    container.innerHTML = '<div class="small">Missing booking id.</div>';
    return;
  }

  try {
    const resp = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`);
    if (!resp.ok) throw new Error('Booking not found');
    const booking = await resp.json();
    const flightResp = await fetch(`/api/flights/${encodeURIComponent(booking.flightId)}`);
    const flight = flightResp.ok ? await flightResp.json() : null;

    container.innerHTML = `
      <div class="flight-title">Booking ID: ${booking.bookingId}</div>
      <div class="small">Passenger: ${booking.passenger.name}</div>
      <div class="small">Email: ${booking.passenger.email}</div>
      <div class="small">Phone: ${booking.passenger.phone}</div>
      <div class="small">Flight: ${flight ? flight.flightName + ' (' + flight.flightNumber + ')' : booking.flightId}</div>
      <div class="small">Route: ${flight ? flight.origin + ' → ' + flight.destination + ' • ' + flight.date : ''}</div>
      <div class="small">Seat: ${booking.seat || '—'}</div>
      <div style="margin-top:12px;" class="badge">Payment: ${booking.paymentStatus}</div>
      <div class="section small note">A copy of this booking is stored in passengers.json on the server (demo)</div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="small">Failed to load confirmation.</div>';
  }
});
