// public/js/booking.js
async function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener('DOMContentLoaded', async () => {
  const flightId = await getQueryParam('flightId');
  const flightSummary = document.getElementById('flightSummary');
  const form = document.getElementById('passengerForm');
  
  // Add real-time age validation
  const ageInput = document.getElementById('age');
  if (ageInput) {
    ageInput.addEventListener('input', function() {
      const age = parseInt(this.value);
      if (this.value && (age <= 0 || age > 120 || isNaN(age))) {
        this.classList.add('error');
        this.classList.remove('success');
      } else if (this.value && age > 0 && age <= 120) {
        this.classList.add('success');
        this.classList.remove('error');
      } else {
        this.classList.remove('error', 'success');
      }
    });
    
    // Prevent negative numbers
    ageInput.addEventListener('keydown', function(e) {
      if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
        e.preventDefault();
      }
    });
  }
  
  // Add real-time emergency contact validation
  const emergencyInput = document.getElementById('emergencyContact');
  if (emergencyInput) {
    emergencyInput.addEventListener('input', function() {
      const contact = this.value;
      if (contact && !/^\d{10}$/.test(contact)) {
        this.classList.add('error');
        this.classList.remove('success');
      } else if (contact && /^\d{10}$/.test(contact)) {
        this.classList.add('success');
        this.classList.remove('error');
      } else {
        this.classList.remove('error', 'success');
      }
    });
    
    // Only allow digits
    emergencyInput.addEventListener('keydown', function(e) {
      if (!/^\d$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    });
  }

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
    // Format date for display
    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch (error) {
        return dateString;
      }
    };

    // Format price with proper formatting
    const formatPrice = (price) => {
      return `₹${price.toLocaleString('en-IN')}`;
    };

    // Check if flight has via/stop information
    const viaInfo = flight.via ? `<div class="flight-via">Via: ${flight.via}</div>` : '';

    flightSummary.innerHTML = `
      <div class="flight-summary-card">
        <div class="flight-header">
          <div class="flight-airline">
            <h3 class="flight-name">${flight.flightName}</h3>
            <span class="flight-number">${flight.flightNumber}</span>
          </div>
          <div class="flight-price">
            <div class="price-amount">${formatPrice(flight.price)}</div>
            <div class="price-label">Total Price</div>
          </div>
        </div>
        
        <div class="flight-route">
          <div class="route-info">
            <div class="airport-code">${flight.origin.split('(')[1]?.replace(')', '') || flight.origin}</div>
            <div class="airport-name">${flight.origin.split('(')[0]?.trim() || flight.origin}</div>
          </div>
          <div class="flight-details">
            <div class="flight-date">${formatDate(flight.date)}</div>
            <div class="flight-timing">
              <span class="departure">${flight.departureTime}</span>
              <span class="duration">${flight.duration || 'N/A'}</span>
              <span class="arrival">${flight.arrivalTime}</span>
            </div>
            ${viaInfo}
          </div>
          <div class="route-info">
            <div class="airport-code">${flight.destination.split('(')[1]?.replace(')', '') || flight.destination}</div>
            <div class="airport-name">${flight.destination.split('(')[0]?.trim() || flight.destination}</div>
          </div>
        </div>
        
        <div class="flight-meta">
          <div class="meta-item">
            <span class="meta-label">Departure:</span>
            <span class="meta-value">${flight.departureTime}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Arrival:</span>
            <span class="meta-value">${flight.arrivalTime}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Duration:</span>
            <span class="meta-value">${flight.duration || 'N/A'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Date:</span>
            <span class="meta-value">${formatDate(flight.date)}</span>
          </div>
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
      address: document.getElementById('address').value.trim(),
      emergencyContact: document.getElementById('emergencyContact').value.trim()
    };

    // basic validations
    if (!/^\d{10}$/.test(passenger.phone)) return alert('Phone must be 10 digits');
    if (!/^\d{12}$/.test(passenger.aadhar)) return alert('Aadhar must be 12 digits');
    if (!/^\S+@\S+\.\S+$/.test(passenger.email)) return alert('Enter a valid email');
    if (passenger.age <= 0 || passenger.age > 120) return alert('Age must be a positive number between 1 and 120');
    if (!/^\d{10}$/.test(passenger.emergencyContact)) return alert('Emergency contact must be 10 digits');

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
