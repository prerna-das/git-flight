// This file contains the main JavaScript code for the application, handling client-side interactions and API calls.

document.addEventListener('DOMContentLoaded', () => {
    const flightSearchForm = document.getElementById('flight-search-form');
    const helicopterSearchForm = document.getElementById('helicopter-search-form');

    if (flightSearchForm) {
        flightSearchForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(flightSearchForm);
            const searchParams = new URLSearchParams(formData);

            try {
                const response = await fetch(`/api/flights?${searchParams}`);
                const data = await response.json();
                // Handle flight search results
                console.log(data);
            } catch (error) {
                console.error('Error fetching flight data:', error);
            }
        });
    }

    if (helicopterSearchForm) {
        helicopterSearchForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(helicopterSearchForm);
            const searchParams = new URLSearchParams(formData);

            try {
                const response = await fetch(`/api/helicopters?${searchParams}`);
                const data = await response.json();
                // Handle helicopter search results
                console.log(data);
            } catch (error) {
                console.error('Error fetching helicopter data:', error);
            }
        });
    }
});