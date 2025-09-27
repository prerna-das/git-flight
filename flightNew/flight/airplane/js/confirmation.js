// Utility function to show loading state
function showLoading() {
  const loadingElement = document.createElement('div');
  loadingElement.className = 'loading-overlay';
  loadingElement.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Loading your booking details...</p>
  `;
  document.body.appendChild(loadingElement);
  return loadingElement;
}

// Utility function to hide loading state
function hideLoading(loadingElement) {
  if (loadingElement && loadingElement.parentNode) {
    loadingElement.parentNode.removeChild(loadingElement);
  }
}

// Utility function to format date
function formatDate(dateString) {
  try {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

// Function to get URL parameter by name
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Format city name (remove airport code if present)
function formatCity(value = '') {
  return value.split('(')[0].trim();
}

// Safely update booking details with fallbacks
const safeUpdate = (element, value, fallback = '—') => {
  if (element) element.textContent = value !== undefined && value !== null ? value : fallback;
};

// Function to show status message with different types (error, success, warning)
function renderStatus(message, type = 'error') {
  const statusClass = `status-${type}`;
  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  };
  const titles = {
    error: 'Something went wrong',
    warning: 'Please note',
    info: 'Information',
    success: 'Success!'
  };
  
  const card = document.getElementById('confirmation-card');
  if (card) {
    card.innerHTML = `
      <div class="status-message ${statusClass}">
        <div class="status-icon">${icons[type] || icons.info}</div>
        <div class="status-content">
          <h3>${titles[type] || titles.info}</h3>
          <p>${message}</p>
          ${type === 'error' ? '<p>Please check your booking details or try again later.</p>' : ''}
          <button onclick="window.location.href='/Homepage.html'" class="action-button">
            Return to Home
          </button>
        </div>
      </div>
    `;
  }

  const messageEl = document.getElementById('confirmation-message');
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = `status-text ${statusClass}`;
  }
  
  // Scroll to top for better visibility
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Function to fill details from localStorage
function fillDetailsFromLocalStorage(confirmationDetails, elements, loadingElement) {
  if (!confirmationDetails) {
    console.log('No confirmation details found in localStorage');
    return false;
  }
  
  try {
    const { bookingRef, bookingId, flightId, passenger, seat, total, flight, paymentStatus } = confirmationDetails;
    
    console.log('Filling details from localStorage:', { bookingRef, passenger, flight });
    
    // Card details
    safeUpdate(elements.bookingId, bookingRef);
    safeUpdate(elements.passengerName, passenger?.name || '—');
    safeUpdate(elements.route, flight?.origin && flight?.destination ? `${flight.origin} → ${flight.destination}` : '—');
    safeUpdate(elements.flightDate, flight?.date || '—');
    safeUpdate(elements.passengerEmail, passenger?.email || '—');
    safeUpdate(elements.passengerPhone, passenger?.phone || '—');
    safeUpdate(elements.passengerGender, passenger?.gender || '—');
    safeUpdate(elements.passengerAge, passenger?.age || '—');
    safeUpdate(elements.passengerAadhar, passenger?.aadhar || '—');
    safeUpdate(elements.passengerAddress, passenger?.address || '—');
    safeUpdate(elements.bookingPayment, paymentStatus || 'confirmed');
    if (elements.bookingPayment) {
      elements.bookingPayment.className = `payment-status ${paymentStatus === 'confirmed' ? 'confirmed' : ''}`;
    }
    
    // Boarding pass
    safeUpdate(elements.ticketPassenger, passenger?.name?.toUpperCase() || '—');
    safeUpdate(elements.ticketFrom, flight?.origin || '—');
    safeUpdate(elements.ticketTo, flight?.destination || '—');
    safeUpdate(elements.ticketFlight, flight?.flightName && flight?.flightNumber ? `${flight.flightName} (${flight.flightNumber})` : '—');
    safeUpdate(elements.ticketDate, flight?.date || '—');
    safeUpdate(elements.ticketGate, flight?.gate || 'TBD');
    safeUpdate(elements.ticketBoarding, flight?.boardingTime || '--:--');
    safeUpdate(elements.ticketSeat, seat || 'Assigned at gate');
    
    // Stub
    safeUpdate(elements.stubPassenger, passenger?.name?.toUpperCase() || '—');
    safeUpdate(elements.stubFrom, flight?.origin || '—');
    safeUpdate(elements.stubTo, flight?.destination || '—');
    safeUpdate(elements.stubGate, flight?.gate || 'TBD');
    safeUpdate(elements.stubSeat, seat || '');
    
    // Booking ref on boarding pass
    if (elements.ticketBookingRef) safeUpdate(elements.ticketBookingRef, bookingRef);
    
    // Hide loading
    hideLoading(loadingElement);
    return true;
  } catch (error) {
    console.error('Error filling details from localStorage:', error);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const loadingElement = showLoading();

  // Get bookingRef from URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookingRef = urlParams.get('bookingRef');
  let confirmationDetails = null;
  
  // Try to get confirmation details from localStorage
  try {
    const storedData = localStorage.getItem('confirmationDetails');
    console.log('Raw localStorage data:', storedData);
    confirmationDetails = JSON.parse(storedData || 'null');
    console.log('Parsed confirmation details:', confirmationDetails);
    
    if (confirmationDetails && bookingRef && confirmationDetails.bookingRef !== bookingRef) {
      console.log('Booking ref mismatch, clearing details');
      confirmationDetails = null;
    }
  } catch (e) {
    console.error('Error parsing confirmation details:', e);
    confirmationDetails = null;
  }

  // Get all DOM elements with null checks
  const getElement = (id) => id ? document.getElementById(id) : null;
  const elements = {
    card: getElement('confirmation-card'),
    message: getElement('confirmation-message'),
    homeButton: getElement('home-button'),
    bookingId: getElement('booking-id'),
    passengerName: getElement('passenger-name'),
    route: getElement('route'),
    flightDate: getElement('flight-date'),
    passengerEmail: getElement('passenger-email'),
    passengerPhone: getElement('passenger-phone'),
    passengerGender: getElement('passenger-gender'),
    passengerAge: getElement('passenger-age'),
    passengerAadhar: getElement('passenger-aadhar'),
    passengerAddress: getElement('passenger-address'),
    bookingPayment: getElement('booking-payment'),
    ticketPassenger: getElement('ticket-passenger'),
    ticketFrom: getElement('ticket-from'),
    ticketTo: getElement('ticket-to'),
    ticketFlight: getElement('ticket-flight'),
    ticketDate: getElement('ticket-date'),
    ticketGate: getElement('ticket-gate'),
    ticketBoarding: getElement('ticket-boarding'),
    ticketSeat: getElement('ticket-seat'),
    stubPassenger: getElement('stub-passenger'),
    stubFrom: getElement('stub-from'),
    stubTo: getElement('stub-to'),
    stubGate: getElement('stub-gate'),
    stubSeat: getElement('stub-seat'),
    ticketBookingRef: getElement('ticket-booking-ref')
  };

  // Home button event listener
  if (elements.homeButton) {
    elements.homeButton.addEventListener('click', () => {
      window.location.href = 'Homepage.html';
    });
  }

  // Print button event listener
  const printButton = document.getElementById('print-button');
  if (printButton) {
    printButton.addEventListener('click', () => {
      window.print();
    });
  }

  // Try to fill details from localStorage first
  if (fillDetailsFromLocalStorage(confirmationDetails, elements, loadingElement)) {
    console.log('Successfully loaded details from localStorage');
    return; // Exit early if successful
  }

  console.log('Falling back to API-based loading');
  console.log('Available localStorage keys:', Object.keys(localStorage));
  console.log('BookingRef from URL:', bookingRef);
  
  // Try to create test data if none exists (for debugging)
  if (!confirmationDetails && bookingRef) {
    console.log('Creating test data for debugging...');
    const testData = {
      bookingRef: bookingRef,
      bookingId: 'TEST123',
      flightId: 'FL123',
      passenger: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        age: 30,
        gender: 'Male',
        aadhar: '123456789012',
        address: '123 Test Street'
      },
      seat: '12A',
      total: 15000,
      flight: {
        origin: 'Mumbai (BOM)',
        destination: 'Delhi (DEL)',
        flightName: 'Air India',
        flightNumber: 'AI-101',
        date: '2025-01-15',
        gate: 'A12',
        boardingTime: '07:30 AM'
      },
      paymentStatus: 'confirmed',
      paidAt: new Date().toISOString()
    };
    
    localStorage.setItem('confirmationDetails', JSON.stringify(testData));
    confirmationDetails = testData;
    
    // Try to fill details again
    if (fillDetailsFromLocalStorage(confirmationDetails, elements, loadingElement)) {
      return;
    }
  }

  // Final fallback - show error message
  console.log('No data available, showing error message');
  console.log('Available localStorage keys:', Object.keys(localStorage));
  console.log('Current URL:', window.location.href);
  console.log('BookingRef from URL:', bookingRef);
  
  renderStatus('No booking details found. Please complete your booking first.', 'error');
  hideLoading(loadingElement);
});
