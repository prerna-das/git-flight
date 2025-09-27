import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js";
import { auth } from '../../firebase/firebaseConfig.js';

const functions = getFunctions();
const searchFlights = httpsCallable(functions, 'searchFlights');

const flightSearchForm = document.getElementById('flight-search-form');
const flightResultsSection = document.getElementById('flight-results-section');
const flightResultsContainer = document.getElementById('flight-results');

flightSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
        alert("Please log in to search for flights.");
        window.location.href = 'login.html';
        return;
    }

    const departure_id = flightSearchForm.departure_id.value;
    const arrival_id = flightSearchForm.arrival_id.value;
    const outbound_date = flightSearchForm.outbound_date.value;
    const return_date = flightSearchForm.return_date.value;
    const adults = flightSearchForm.adults.value;
    const currency = flightSearchForm.currency.value;

    flightResultsSection.classList.remove('hidden');
    flightResultsContainer.innerHTML = '<p class="text-center">Searching for flights...</p>';

    searchFlights({ departure_id, arrival_id, outbound_date, return_date, adults, currency })
        .then((result) => {
            const flights = result.data.best_flights;
            displayFlights(flights);
        })
        .catch((error) => {
            console.error("Error searching for flights:", error);
            flightResultsContainer.innerHTML = `<p class="text-center text-red-500">Error: ${error.message}</p>`;
        });
});

function displayFlights(flights) {
    if (!flights || flights.length === 0) {
        flightResultsContainer.innerHTML = '<p class="text-center">No flights found for the selected criteria.</p>';
        return;
    }

    let resultsHtml = '';
    flights.forEach(flight => {
        resultsHtml += `
            <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-lg font-semibold">${flight.flights[0].airline}</p>
                        <p class="text-sm text-gray-600">${flight.flights[0].departure_airport.name} (${flight.flights[0].departure_airport.id}) to ${flight.flights[0].arrival_airport.name} (${flight.flights[0].arrival_airport.id})</p>
                        <p class="text-sm text-gray-500">Duration: ${flight.total_duration} minutes</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xl font-bold">${flight.price}</p>
                        <p class="text-sm text-gray-500">${flight.type}</p>
                    </div>
                </div>
            </div>
        `;
    });

    flightResultsContainer.innerHTML = resultsHtml;
}