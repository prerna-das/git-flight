// List of available airports with IATA codes
const airports = [
  { name: 'Mumbai', code: 'BOM' },
  { name: 'Delhi', code: 'DEL' },
  { name: 'Bangalore', code: 'BLR' },
  { name: 'Hyderabad', code: 'HYD' },
  { name: 'Chennai', code: 'MAA' },
  { name: 'Kolkata', code: 'CCU' },
  { name: 'Ahmedabad', code: 'AMD' },
  { name: 'Pune', code: 'PNQ' },
  { name: 'Goa', code: 'GOI' },
  { name: 'Kochi', code: 'COK' },
  { name: 'Jaipur', code: 'JAI' },
  { name: 'Lucknow', code: 'LKO' },
  { name: 'Dubai', code: 'DXB' },
  { name: 'London', code: 'LHR' },
  { name: 'Singapore', code: 'SIN' },
  { name: 'Bangkok', code: 'BKK' },
  { name: 'New York', code: 'JFK' }
];

// Function to create autocomplete dropdown
function createAutocomplete(input, container) {
  let currentFocus = -1;
  
  input.addEventListener('input', function() {
    const val = this.value.toLowerCase();
    closeAllLists();
    
    if (!val) { return false; }
    
    const dropdown = document.createElement('div');
    dropdown.setAttribute('id', `${this.id}-autocomplete-list`);
    dropdown.setAttribute('class', 'autocomplete-items');
    
    // Filter airports based on input
    const matches = airports.filter(airport => 
      airport.name.toLowerCase().includes(val) || 
      airport.code.toLowerCase().includes(val)
    );
    
    // Create dropdown items
    matches.slice(0, 5).forEach((airport, index) => {
      const item = document.createElement('div');
      item.innerHTML = `
        <strong>${airport.name}</strong>
        <span>${airport.code}</span>
        <input type='hidden' value='${airport.name} (${airport.code})'>
      `;
      item.addEventListener('click', function() {
        input.value = this.getElementsByTagName('input')[0].value;
        closeAllLists();
      });
      dropdown.appendChild(item);
    });
    
    if (matches.length > 0) {
      container.appendChild(dropdown);
    }
  });
  
  // Handle keyboard navigation
  input.addEventListener('keydown', function(e) {
    let items = document.getElementById(`${this.id}-autocomplete-list`);
    if (items) items = items.getElementsByTagName('div');
    
    if (e.keyCode === 40) { // Down arrow
      currentFocus++;
      addActive(items);
    } else if (e.keyCode === 38) { // Up arrow
      currentFocus--;
      addActive(items);
    } else if (e.keyCode === 13) { // Enter
      e.preventDefault();
      if (currentFocus > -1 && items) {
        items[currentFocus].click();
      }
    }
  });
  
  function addActive(items) {
    if (!items) return false;
    removeActive(items);
    
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    
    items[currentFocus].classList.add('autocomplete-active');
  }
  
  function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('autocomplete-active');
    }
  }
  
  function closeAllLists(elmnt) {
    const items = document.getElementsByClassName('autocomplete-items');
    for (let i = 0; i < items.length; i++) {
      if (elmnt !== items[i] && elmnt !== input) {
        items[i].parentNode.removeChild(items[i]);
      }
    }
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    closeAllLists(e.target);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('flight-search-form');
  const statusEl = document.getElementById('search-status');
  const resultsEl = document.getElementById('search-results');
  const originInput = document.getElementById('origin');
  const destinationInput = document.getElementById('destination');

  if (!form || !statusEl || !resultsEl || !originInput || !destinationInput) {
    return;
  }
  
  // Initialize autocomplete for origin and destination inputs
  createAutocomplete(originInput, document.getElementById('search-container'));
  createAutocomplete(destinationInput, document.getElementById('search-container'));

  const updateGroupState = (input) => {
    const group = input.closest('.input__group');
    if (!group) return;

    if (input === document.activeElement) {
      group.classList.add('is-active');
    } else {
      group.classList.remove('is-active');
    }

    if (input.value && input.value.trim() !== '') {
      group.classList.add('has-value');
    } else {
      group.classList.remove('has-value');
    }
  };

  const attachDynamicPlaceholders = () => {
    const inputs = form.querySelectorAll('[data-placeholder]');
    inputs.forEach((input) => {
      const dynamicPlaceholder = input.dataset.placeholder;
      if (!dynamicPlaceholder) return;

      // ensure initial state
      input.placeholder = '';
      updateGroupState(input);

      input.addEventListener('focus', () => {
        input.placeholder = dynamicPlaceholder;
        updateGroupState(input);
      });

      input.addEventListener('blur', () => {
        input.placeholder = '';
        updateGroupState(input);
      });

      input.addEventListener('input', () => {
        updateGroupState(input);
      });
    });
  };

  attachDynamicPlaceholders();

  const renderStatus = (message, type = 'info') => {
    statusEl.textContent = message;
    statusEl.className = `search__status search__status--${type}`;
  };

  // Function to find similar flights on nearby dates
  const findSimilarFlights = async (origin, destination, date) => {
    try {
      // Get flights for the next 3 days
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(dateObj.getDate() + 1);
      const prevDay = new Date(dateObj);
      prevDay.setDate(dateObj.getDate() - 1);
      
      // Format dates as YYYY-MM-DD
      const formatDate = (d) => d.toISOString().split('T')[0];
      const dates = [formatDate(prevDay), formatDate(dateObj), formatDate(nextDay)];
      
      let allFlights = [];
      
      // Fetch flights for each date
      for (const d of dates) {
        const params = new URLSearchParams({
          origin,
          destination,
          date: d
        });
        
        const response = await fetch(`/api/flights?${params.toString()}`);
        if (response.ok) {
          const flights = await response.json();
          allFlights = [...allFlights, ...flights];
        }
      }
      
      return allFlights;
    } catch (error) {
      console.error('Error fetching similar flights:', error);
      return [];
    }
  };

  const renderFlights = (flights, options = {}) => {
    const { isSimilarFlights = false } = options;
    
    if (!Array.isArray(flights) || flights.length === 0) {
      resultsEl.innerHTML = '';
      return false;
    }
    
    const markup = flights
      .sort((a, b) => {
        // Sort by date first, then by price
        const dateA = new Date(a.date || a.departureDate);
        const dateB = new Date(b.date || b.departureDate);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB;
        }
        return (a.price || 0) - (b.price || 0);
      })
      .map((flight) => {
        const via = flight.stops && flight.stops.length > 0 ? 
          `<div class="search__via">Via: ${flight.stops.map(stop => stop.city || stop).join(', ')}</div>` : 
          (flight.via ? `<div class="search__via">Via: ${flight.via}</div>` : '');
          
        const flightDate = new Date(flight.date || flight.departureDate);
        const formattedDate = flightDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        // Handle both flight object structures
        const from = flight.from || flight.origin;
        const to = flight.to || flight.destination;
        const flightName = flight.airline || flight.flightName || 'Flight';
        const flightNumber = flight.flightNumber || flight.id || '';
        const departure = flight.departure || flight.departureTime;
        const arrival = flight.arrival || flight.arrivalTime;
        const price = flight.price ? `₹${flight.price.toLocaleString('en-IN')}` : 'Price not available';
        
        return `
          <article class="search__card">
            <div class="search__card__content">
              <h3>${flightName} <span class="search__number">(${flightNumber})</span></h3>
              <p>${from} → ${to}</p>
              <p>Date: ${formattedDate}</p>
              <p>Departure: ${departure} • Arrival: ${arrival}</p>
              ${flight.duration ? `<p>Duration: ${flight.duration}</p>` : ''}
              ${via}
              ${isSimilarFlights ? '<div class="search__similar">Similar flight (different date)</div>' : ''}
            </div>
            <div class="search__card__meta">
              <div class="search__price">${price}</div>
              <a class="btn btn--secondary" href="/passenger.html?flightId=${encodeURIComponent(flight.id || flight.flightNumber)}">Book</a>
            </div>
          </article>
        `;
      })
      .join('');

    if (isSimilarFlights) {
      resultsEl.innerHTML = `
        <div class="search__no-results">
          <p>No flights found for the selected date. Showing similar flights:</p>
        </div>
        ${markup}
      `;
    } else {
      resultsEl.innerHTML = markup;
    }
    
    return true;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const origin = document.getElementById('origin')?.value.trim();
    const destination = document.getElementById('destination')?.value.trim();
    const departureDate = document.getElementById('departure-date')?.value;

    if (!origin || !destination || !departureDate) {
      renderStatus('Please fill in origin, destination and departure date.', 'error');
      return;
    }

    // Extract IATA code if present (e.g., "Mumbai (BOM)" -> "BOM")
    const getIATACode = (input) => {
      const match = input.match(/\(([A-Z]{3})\)/);
      return match ? match[1] : input;
    };

    const originCode = getIATACode(origin);
    const destinationCode = getIATACode(destination);

    const params = new URLSearchParams({
      origin: originCode,
      destination: destinationCode,
      date: departureDate,
    });

    renderStatus('Searching flights...', 'loading');
    resultsEl.innerHTML = '';

    try {
      const response = await fetch(`/api/flights?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      let flights = await response.json();

      if (!flights || flights.length === 0) {
        // If no flights found, search for similar flights on nearby dates
        renderStatus('Searching for similar flights on nearby dates...', 'info');
        const similarFlights = await findSimilarFlights(originCode, destinationCode, departureDate);
        
        if (similarFlights.length > 0) {
          renderStatus('No flights found for the selected date. Showing similar flights:', 'info');
          renderFlights(similarFlights, { isSimilarFlights: true });
        } else {
          renderStatus('No flights found for the selected route. Please try different airports or dates.', 'info');
          renderFlights([]);
        }
        return;
      }

      renderStatus(`Found ${flights.length} flight${flights.length > 1 ? 's' : ''}.`, 'success');
      renderFlights(flights);
      
      // Store the search results for potential use in payment page
      sessionStorage.setItem('lastSearchResults', JSON.stringify(flights));
      
    } catch (error) {
      console.error('Flight search failed:', error);
      renderStatus('Something went wrong while searching for flights. Please try again.', 'error');
    }
  });
});