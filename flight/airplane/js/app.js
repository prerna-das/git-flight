// public/js/app.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const resultsContainer = document.getElementById('results');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultsContainer.innerHTML = '<div class="small">Searching...</div>';

    const origin = document.getElementById('origin').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const date = document.getElementById('date').value;

    try {
      const q = new URLSearchParams({ origin, destination, date });
      const resp = await fetch(`/api/flights?${q.toString()}`);
      const flights = await resp.json();

      if (!flights || flights.length === 0) {
        resultsContainer.innerHTML = `<div class="small">No flights found for your search.</div>`;
        return;
      }

      // render flights (sorted by price asc)
      flights.sort((a, b) => a.price - b.price);

      resultsContainer.innerHTML = flights.map(f => {
        return `
          <a class="flight-card" href="passenger.html?flightId=${encodeURIComponent(f.id)}">
            <div class="flight-row">
              <div>
                <div class="flight-title">${f.flightName} <span class="small">(${f.flightNumber})</span></div>
                <div class="small">${f.origin} → ${f.destination} • ${f.date}</div>
                <div class="small">Departs: ${f.departureTime} • Arrives: ${f.arrivalTime} • Duration: ${f.duration}</div>
              </div>
              <div class="center">
                <div class="badge">₹ ${f.price}</div>
                <div class="small">Boarding: ${f.boardingTime}${f.via ? ' • Via: '+f.via : ''}</div>
              </div>
            </div>
          </a>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
      resultsContainer.innerHTML = `<div class="small">Error searching flights.</div>`;
    }
  });
});
