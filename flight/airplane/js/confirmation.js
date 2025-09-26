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

// Function to parse form data from URL
function getFormDataFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const formData = {};
  
  // Get all parameters and group them
  for (const [key, value] of params.entries()) {
    // Handle nested objects (e.g., passenger.name)
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (!formData[parent]) formData[parent] = {};
      formData[parent][child] = value;
    } else {
      formData[key] = value;
    }
  }
  return formData;
}
// Format city name (remove airport code if present)
function formatCity(value = '') {
  return value.split('(')[0].trim();
}

// Safely update booking details with fallbacks
const safeUpdate = (element, value, fallback = '—') => {
  if (element) element.textContent = value !== undefined && value !== null ? value : fallback;
};

// Function to update ticket details in the UI
function updateTicketDetails(elements, booking, flight, passengerNameUpper) {
  try {
    // Update ticket details
    safeUpdate(elements.ticketPassenger, passengerNameUpper);
    safeUpdate(elements.ticketFrom, formatCity(flight.origin));
    safeUpdate(elements.ticketTo, formatCity(flight.destination));
    safeUpdate(elements.ticketFlight, flight.flightNumber);
    safeUpdate(elements.ticketDate, formatDate(flight.date));
    safeUpdate(elements.ticketGate, flight.gate, 'TBD');
    safeUpdate(elements.ticketBoarding, flight.boardingTime, '--:--');
    safeUpdate(elements.ticketSeat, booking.seat, 'Assigned at gate');
    
    // Update stub details
    safeUpdate(elements.stubPassenger, passengerNameUpper);
    safeUpdate(elements.stubFrom, formatCity(flight.origin));
    safeUpdate(elements.stubTo, formatCity(flight.destination));
    safeUpdate(elements.stubGate, flight.gate, 'TBD');
    safeUpdate(elements.stubSeat, booking.seat);
    
    // Add animation class to ticket for visual feedback
    const ticket = document.querySelector('.ticket');
    if (ticket) {
      ticket.classList.add('ticket-loaded');
    }
    
  } catch (error) {
    console.error('Error updating ticket details:', error);
    renderStatus('Error displaying ticket information. Please contact support.', 'warning');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const loadingElement = showLoading();
  
  // Get form data from URL parameters
  const formData = getFormDataFromUrl();
  const bookingId = getUrlParameter('bookingId') || 'BK' + Math.floor(100000 + Math.random() * 900000);

  // Get all DOM elements with null checks
  const getElement = (id) => id ? document.getElementById(id) : null;
  // Get all DOM elements with null checks
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
    stubSeat: getElement('stub-seat')
  };

  // Function to show status message with different types (error, success, warning)
  const renderStatus = (message, type = 'error') => {
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
    
    if (elements.card) {
      elements.card.innerHTML = `
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

    if (elements.message) {
      elements.message.textContent = message;
      elements.message.className = `status-text ${statusClass}`;
    }
    
    // Scroll to top for better visibility
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide loading indicator when showing status
    hideLoading(loadingElement);
  };

  // Format city name (remove airport code if present)
  const formatCity = (value = '') => value.split('(')[0].trim().toUpperCase();
  
  // Function to set up print button functionality
  function setupPrintButton(booking, flight) {
    const printButton = document.getElementById('print-button');
    if (!printButton) return;
    
    printButton.addEventListener('click', () => {
      // Create a print-friendly version of the ticket
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>E-Ticket - ${booking.bookingId}</title>
          <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+128+Text&display=swap" rel="stylesheet">
          <style>
            @page { size: auto; margin: 0mm; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              margin: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .ticket { 
              border: 2px solid #1d47ba;
              border-radius: 10px;
              padding: 25px; 
              max-width: 600px; 
              margin: 0 auto;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .header { 
              text-align: center; 
              margin-bottom: 25px;
              padding-bottom: 15px;
              border-bottom: 2px dashed #e0e0e0;
            }
            .header h2 { 
              color: #1d47ba; 
              margin: 0 0 10px 0;
            }
            .details { 
              margin-bottom: 25px; 
            }
            .details h3 {
              color: #1d47ba;
              border-bottom: 1px solid #e0e0e0;
              padding-bottom: 8px;
              margin-top: 0;
            }
            .detail-row { 
              display: flex; 
              margin-bottom: 12px;
              font-size: 15px;
            }
            .label { 
              font-weight: bold; 
              width: 180px;
              color: #555;
            }
            .value { 
              flex: 1;
              color: #333;
            }
            .barcode { 
              text-align: center; 
              margin: 30px 0 20px;
              padding: 15px 0;
              border-top: 2px dashed #e0e0e0;
            }
            .barcode-text {
              font-family: 'Courier New', monospace;
              letter-spacing: 2px;
              margin-bottom: 5px;
            }
            .barcode-svg {
              height: 60px;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #777;
            }
            @media print {
              body { 
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .ticket {
                border: none;
                box-shadow: none;
                padding: 10px;
              }
              button { 
                display: none !important; 
              }
              .no-print {
                display: none !important;
              }
            }
            @page {
              size: auto;
              margin: 5mm;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h2>BOARDING PASS</h2>
              <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                <div style="text-align: left;">
                  <div style="font-size: 12px; color: #666;">PASSENGER NAME</div>
                  <div style="font-size: 18px; font-weight: bold;">" + booking.passenger.name + "</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 12px; color: #666;">BOOKING REF</div>
                  <div style="font-size: 16px; font-weight: bold;">" + booking.bookingId + "</div>
                </div>
              </div>
            </div>
            
            <div style="display: flex; margin: 20px 0;">
              <div style="flex: 1; padding-right: 15px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">FROM</div>
                <div style=\"font-size: 20px; font-weight: bold; margin-bottom: 5px;\">" + flight.origin + "</div>
                <div style="font-size: 14px;">" + (flight.departureTime ? flight.departureTime : '--:--') + "</div>
              </div>
              <div style="width: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="width: 100%; height: 1px; background: #ccc; position: relative; margin: 10px 0;">
                  <div style="position: absolute; left: 0; top: -4px; width: 10px; height: 10px; border-radius: 50%; background: #1d47ba;"></div>
                  <div style="position: absolute; right: 0; top: -4px; width: 10px; height: 10px; border-radius: 50%; background: #1d47ba; opacity: 0.5;"></div>
                </div>
                <div style=\"font-size: 10px; color: #666; text-align: center; margin-top: 5px;\">" + (flight.duration ? flight.duration : '--h --m') + "</div>
              </div>
              <div style="flex: 1; padding-left: 15px;">
                <div style=\"font-size: 12px; color: #666; margin-bottom: 5px;\">TO</div>
                <div style=\"font-size: 20px; font-weight: bold; margin-bottom: 5px;\">" + (flight.destination ? flight.destination : '--') + "</div>
                <div style=\"font-size: 14px;\">" + (flight.arrivalTime ? flight.arrivalTime : '--:--') + "</div>
              </div>
            </div>
            
            <div style="display: flex; background: #f5f7ff; border-radius: 8px; padding: 15px; margin: 15px 0;">
              <div style="flex: 1;">
                <div style="font-size: 11px; color: #666; margin-bottom: 3px;">FLIGHT</div>
                <div style=\"font-size: 16px; font-weight: bold;\">" + flight.flightNumber + "</div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 11px; color: #666; margin-bottom: 3px;">DATE</div>
                <div style=\"font-size: 16px; font-weight: bold;\">" + formatDate(flight.date) + "</div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 11px; color: #666; margin-bottom: 3px;">GATE</div>
                <div style=\"font-size: 16px; font-weight: bold;\">" + (flight.gate ? flight.gate : 'TBD') + "</div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 11px; color: #666; margin-bottom: 3px;">SEAT</div>
                <div style=\"font-size: 16px; font-weight: bold;\">" + (booking.seat ? booking.seat : 'TBD') + "</div>
              </div>
            </div>
            
            <div class=\"barcode\">
              <div class=\"barcode-text\">" + (booking.bookingId ? booking.bookingId : 'N/A') + "</div>
              <div style=\"font-family: 'Libre Barcode 128 Text', cursive; font-size: 60px; line-height: 1; margin-top: -10px;\">" + 
                (booking.bookingId ? booking.bookingId : 'N/A') + 
              "</div>
              <div style=\"margin-top: 5px; font-size: 12px; color: #666;\">SCAN AT GATE</div>
            </div>
            
            <div class=\"footer\">\n              <p>Thank you for flying with us! Please arrive at the gate at least 45 minutes before departure.</p>\n              <p>For any assistance, please contact our customer service at +1-800-FLY-AWAY</p>\n            </div>
          </div>
          
          <div style="text-align: center; margin: 20px 0;" class="no-print">
            <button onclick="window.print()" style="
              background: #1d47ba;
              color: white;
              border: none;
              padding: 10px 25px;
              font-size: 16px;
              border-radius: 5px;
              cursor: pointer;
              margin-right: 10px;
            ">
              <i class="fas fa-print"></i> Print Ticket
            </button>
            <button onclick="window.close()" style="
              background: #f0f0f0;
              color: #333;
              border: 1px solid #ddd;
              padding: 10px 25px;
              font-size: 16px;
              border-radius: 5px;
              cursor: pointer;
            ">
              Close
            </button>
          </div>
          
          <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
          <script>
            // Auto-print when the window loads
            window.onload = function() {
              // Small delay to ensure everything is rendered
              setTimeout(function() {
                window.print();
                // Close the window after printing (with a delay to allow print dialog to show)
                setTimeout(function() {
                  // Only close if not in print preview
                  if (!window.matchMedia('print').matches) {
                    // window.close();
                  }
                }, 1000);
              }, 500);
            };
            
            // Close the window when print is complete
            window.onafterprint = function() {
              // Don't auto-close as it might be cancelled
              // window.close();
            };
          </script>
        </body>
        </html>
      `;
      
      // Open print window
      const printWindow = window.open('', '_blank', 'width=800,height=1000');
      printWindow.document.write(printContent);
      printWindow.document.close();
    });
  }
  
  // Function to update booking details in the UI
  function updateBookingDetails(elements, booking, flight, passengerName, passengerNameUpper) {
    // Safely update booking details with fallbacks
    const safeUpdate = (element, value, fallback = '—') => {
      if (element) element.textContent = value !== undefined && value !== null ? value : fallback;
    };
    
    // Update booking details
    safeUpdate(elements.bookingId, booking.bookingId);
    safeUpdate(elements.passengerName, passengerName);
    safeUpdate(elements.route, flight.origin && flight.destination ? 
      `${flight.origin} → ${flight.destination}` : '—');
    safeUpdate(elements.flightDate, flight.date);
    safeUpdate(elements.passengerEmail, booking.passenger.email);
    safeUpdate(elements.passengerPhone, booking.passenger.phone);
    safeUpdate(elements.passengerGender, booking.passenger.gender);
    safeUpdate(elements.passengerAge, booking.passenger.age);
    safeUpdate(elements.passengerAadhar, booking.passenger.aadhar);
    safeUpdate(elements.passengerAddress, booking.passenger.address);
    safeUpdate(elements.bookingPayment, booking.paymentStatus, 'pending');
    
    // Add payment status class for styling
    if (elements.bookingPayment) {
      elements.bookingPayment.className = `payment-status ${booking.paymentStatus || 'pending'}`;
    }
    
    // Update ticket details
    updateTicketDetails(elements, booking, flight, passengerNameUpper);
    
    // Update confirmation message based on payment status
    if (elements.message) {
      elements.message.textContent = booking.paymentStatus === 'confirmed'
        ? 'Your payment is confirmed. A copy of the e-ticket has been sent to your email.'
        : 'Payment is pending. Our support team will reach out shortly to finalize the booking.';
    }
    
    // Hide loading indicator when done
    hideLoading(loadingElement);
  }
  
  // Function to update ticket details in the UI
  function updateTicketDetails(elements, booking, flight, passengerNameUpper) {
    try {
      // Ticket section
      safeUpdate(elements.ticketPassenger, passengerNameUpper);
      safeUpdate(elements.ticketFrom, formatCity(flight.origin));
      safeUpdate(elements.ticketTo, formatCity(flight.destination));
      
      // Format flight info
      const flightInfo = [];
      if (flight.flightName) flightInfo.push(flight.flightName);
      if (flight.flightNumber) flightInfo.push(flight.flightNumber);
      safeUpdate(elements.ticketFlight, flightInfo.length ? flightInfo.join(' • ') : '—');
      
      // Format date with error handling
      try {
        const formattedDate = formatDate(flight.date);
        safeUpdate(elements.ticketDate, formattedDate);
      } catch (err) {
        console.error('Error formatting date:', err);
        safeUpdate(elements.ticketDate, flight.date);
      }
      
      // Update gate, boarding time, and seat
      safeUpdate(elements.ticketGate, flight.gate, 'TBD');
      safeUpdate(elements.ticketBoarding, flight.boardingTime);
      safeUpdate(elements.ticketSeat, booking.seat, 'Assigned at gate');
      
      // Update ticket stub details
      safeUpdate(elements.stubPassenger, passengerNameUpper);
      safeUpdate(elements.stubFrom, formatCity(flight.origin));
      safeUpdate(elements.stubTo, formatCity(flight.destination));
      safeUpdate(elements.stubGate, flight.gate, 'TBD');
      safeUpdate(elements.stubSeat, booking.seat);
      
      // Add animation class to ticket for visual feedback
      const ticket = document.querySelector('.ticket');
      if (ticket) {
        ticket.classList.add('ticket-loaded');
      }
      
    } catch (error) {
      console.error('Error updating ticket details:', error);
      renderStatus('Error displaying ticket information. Please contact support.', 'warning');
    }
  }

    // Home button event listener
  if (elements.homeButton) {
    elements.homeButton.addEventListener('click', () => {
      // Use a relative path that works from any directory
      window.location.href = 'Homepage.html';
    });
  }

  try {
    // Fetch booking details from the API using the bookingId from the URL
    const bookingResponse = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`);
    if (!bookingResponse.ok) {
      throw new Error('Failed to fetch booking details');
    }
    const booking = await bookingResponse.json();

    // Fetch flight details using the flightId from the booking
    const flightResponse = await fetch(`/api/flights/${encodeURIComponent(booking.flightId)}`);
    if (!flightResponse.ok) {
      throw new Error('Failed to fetch flight details');
    }
    const flight = await flightResponse.json();
    
    // Initialize print functionality
    setupPrintButton(booking, flight);
    
    // Extract passenger details
    const passenger = booking.passenger || {};
    const passengerName = passenger.name || '—';
    const passengerNameUpper = passengerName.toString().toUpperCase();
    
    // Update the UI with the booking and flight details
    updateBookingDetails(elements, booking, flight, passengerName, passengerNameUpper);
    
    // Update confirmation message based on payment status
    if (elements.message) {
      elements.message.textContent = booking.paymentStatus === 'confirmed'
        ? 'Your payment is confirmed. A copy of the e-ticket has been sent to your email.'
        : 'Payment is pending. Our support team will reach out shortly to finalize the booking.';
    }
  } catch (error) {
    console.error('Failed to load booking confirmation', error);
    
    // More specific error messages based on error type
    let errorMessage = 'Something went wrong while loading your confirmation.';
    
    if (error.message.includes('timeout')) {
      errorMessage = 'The request took too long. Please check your internet connection and try again.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    renderStatus(errorMessage, 'error');
  } finally {
    // Always hide loading indicator when done
    hideLoading(loadingElement);
    
    // Add event listener for print button if it exists
    const printButton = document.getElementById('print-button');
    if (printButton) {
      printButton.addEventListener('click', () => window.print());
    }
    
    // Add animation to show content is loaded
    document.body.classList.add('page-loaded');
  }
});
