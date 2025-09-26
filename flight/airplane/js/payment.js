// public/js/payment.js
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('bookingId');
  const summary = document.getElementById('paymentSummary');
  const btn = document.getElementById('confirmPaymentBtn');

  if (!bookingId) {
    summary.innerHTML = '<div class="small">Missing booking id.</div>';
    btn.disabled = true;
    return;
  }

  try {
    const resp = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`);
    if (!resp.ok) throw new Error('Booking not found');
    const booking = await resp.json();

    // need flight details to show price
    const flightResp = await fetch(`/api/flights/${encodeURIComponent(booking.flightId)}`);
    const flight = flightResp.ok ? await flightResp.json() : null;

    summary.innerHTML = `
      <div class="flight-title">Booking: ${booking.bookingId}</div>
      <div class="small">Passenger: ${booking.passenger.name}</div>
      <div class="small">Flight: ${flight ? flight.flightName+' ('+flight.flightNumber+')' : booking.flightId}</div>
      <div class="small">Seat: ${booking.seat || 'Not selected'}</div>
      <div style="margin-top:10px;" class="badge">Amount: ₹ ${flight ? flight.price : '—'}</div>
    `;

    btn.addEventListener('click', async () => {
      try {
        const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/payment`, { method: 'POST' });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Payment failed');
        }
        // redirect to confirmation
        window.location.href = `confirmation.html?bookingId=${encodeURIComponent(bookingId)}`;
      } catch (err) {
        console.error(err);
        alert('Payment failed: ' + err.message);
      }
    });

  } catch (err) {
    console.error(err);
    summary.innerHTML = '<div class="small">Failed to load booking data.</div>';
    btn.disabled = true;
  }
});
