// document.getElementById('searchBtn').addEventListener('click', () => {
//   alert('Search clicked – yahan apna search code likho');
// });
// Jab page load ho tab flights fetch karo
document.addEventListener("DOMContentLoaded", () => {
  loadFlights();
});

// Button click pe bhi reload kara sakte ho
document.getElementById("searchBtn").addEventListener("click", loadFlights);

function loadFlights() {
  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      const flightsContainer = document.getElementById("flightsContainer");
      flightsContainer.innerHTML = ""; // Purana clear karo

      data.forEach(flight => {
        // har flight ke liye card banate hai
        const card = document.createElement("div");
        card.className = "flight-card";
        card.innerHTML = `
          <div class="flight-details">
            <div>Flight Number: <span>${flight.flightNumber}</span></div>
            <div>to: <span>${flight.to}</span></div>
            <div>from: <span>${flight.from}</span></div>
            <div class="airline">✈ ${flight.airline}</div>
          </div>
          <div class="flight-details">
            <div>departure: <span>${flight.departure}</span></div>
            <div>arrival: <span>${flight.arrival}</span></div>
          </div>
        `;
        flightsContainer.appendChild(card);
      });
    })
    .catch(err => console.error("Error loading flights:", err));
}
