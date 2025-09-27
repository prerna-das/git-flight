document.addEventListener('DOMContentLoaded', () => {
    const methodList = document.getElementById('method-list');
    const formSections = document.querySelectorAll('.form-section');
    const payNowBtn = document.getElementById('pay-now-btn');
    const promoCodeInput = document.getElementById('promo-code');
    const applyPromoBtn = document.querySelector('.apply-btn');
    const promoMessage = document.getElementById('promo-message');
    const paymentStatusMessage = document.getElementById('payment-status-message');
    const summaryLoading = document.getElementById('summary-loading');
    const fareDetails = document.querySelector('.fare-details');
    const totalElement = document.getElementById('total');
    const messageBox = document.getElementById('message-box');
    const messageTitle = document.getElementById('message-title');
    const messageContent = document.getElementById('message-content');
    const messageCloseBtn = document.getElementById('message-close-btn');
    const bookingDetailsSection = document.getElementById('booking-details');
    const mobileMethodSelect = document.getElementById('payment-method-select');

    // --- Utility Functions ---

    function showMessage(title, content) {
        messageTitle.textContent = title;
        messageContent.textContent = content;
        messageBox.classList.add('visible');
    }

    function hideMessage() {
        messageBox.classList.remove('visible');
    }

    // --- Core App Logic ---

    // Helper to get query param
    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    // Load booking and flight details
    async function loadBookingAndFlight() {
        const bookingId = getQueryParam('bookingId');
        if (!bookingId) {
            document.getElementById('booking-header').textContent = 'No booking found.';
            return;
        }
        try {
            // Try to get from localStorage first
            let booking = JSON.parse(localStorage.getItem('booking_' + bookingId) || 'null');
            let flight = null;
            if (!booking) {
                // Fallback: fetch from API
                const bookingResp = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`);
                if (!bookingResp.ok) throw new Error('Booking not found');
                booking = await bookingResp.json();
                localStorage.setItem('booking_' + bookingId, JSON.stringify(booking));
            }
            // Fetch flight details
            const flightResp = await fetch(`/api/flights/${encodeURIComponent(booking.flightId)}`);
            if (!flightResp.ok) throw new Error('Flight not found');
            flight = await flightResp.json();
            localStorage.setItem('flight_' + booking.flightId, JSON.stringify(flight));

            // Show trip summary
            const bookingDetailsSection = document.getElementById('booking-details');
            bookingDetailsSection.classList.remove('hidden');
            document.getElementById('route').textContent = `Route: ${flight.origin} → ${flight.destination}`;
            document.getElementById('flight-info').textContent = `Flight: ${flight.flightName} (${flight.flightNumber}), ${flight.departureTime} - ${flight.arrivalTime}`;
            document.getElementById('passenger-info').textContent = `Passenger: ${booking.passenger.name}, ${booking.passenger.age} ${booking.passenger.gender}`;
            document.getElementById('seat-info').textContent = `Seat: ${booking.seat || 'Not selected'}`;

            // Calculate fare
            const baseFare = Number(flight.price) || 0;
            const taxes = Math.round(baseFare * 0.18); // 15% tax
            const convenienceFee = 1050; // fixed
            let discount = 720;
            let total = baseFare + taxes + convenienceFee;

            document.getElementById('fare').textContent = `₹${baseFare.toLocaleString('en-IN')}`;
            document.getElementById('fee').textContent = `₹${taxes.toLocaleString('en-IN')}`;
            document.getElementById('convenience').textContent = `₹${convenienceFee.toLocaleString('en-IN')}`;
            document.getElementById('discount').textContent = `₹${discount.toLocaleString('en-IN')}`;
            totalElement.textContent = `₹${total.toLocaleString('en-IN')}`;

            payNowBtn.dataset.baseFare = baseFare;
            payNowBtn.dataset.taxes = taxes;
            payNowBtn.dataset.convenienceFee = convenienceFee;
            payNowBtn.dataset.total = total;
            payNowBtn.disabled = false;

            // Store for later use
            localStorage.setItem('currentBookingId', bookingId);
            localStorage.setItem('currentFlightId', booking.flightId);
            localStorage.setItem('currentPassenger', JSON.stringify(booking.passenger));
            localStorage.setItem('currentSeat', booking.seat || '');
            localStorage.setItem('currentTotal', total);
        } catch (err) {
            console.error('Error loading booking:', err);
            document.getElementById('booking-header').textContent = 'Failed to load booking.';
            summaryLoading.textContent = 'Failed to load booking.';
            fareDetails.style.display = 'none';
            payNowBtn.disabled = true;
            
            // Show error message to user
            showMessage('Error', 'Failed to load booking details. Please try again.');
        }
        summaryLoading.style.display = 'none';
        fareDetails.style.display = 'block';
    }

    // Call loader
    setTimeout(loadBookingAndFlight, 500);

    // Function to switch payment forms
    const switchForm = (method) => {
        formSections.forEach(section => {
            section.style.display = 'none';
        });
        const selectedForm = document.getElementById(method);
        if (selectedForm) {
            selectedForm.style.display = 'block';
        }
    };
    
    // Event listeners for method selection
    if (methodList) {
        methodList.addEventListener('click', (e) => {
            const targetLi = e.target.closest('li');
            if (targetLi) {
                // Remove 'active' class from all list items
                document.querySelectorAll('.payment-method-item').forEach(li => {
                    li.classList.remove('active');
                });
                // Add 'active' class to the clicked one
                targetLi.classList.add('active');
                switchForm(targetLi.dataset.method);
                mobileMethodSelect.value = targetLi.dataset.method;
            }
        });
    }

    // Event listener for mobile dropdown menu
    if (mobileMethodSelect) {
        mobileMethodSelect.addEventListener('change', (e) => {
            const selectedMethod = e.target.value;
            const selectedLi = document.querySelector(`.payment-method-item[data-method="${selectedMethod}"]`);
            if (selectedLi) {
                selectedLi.click();
            }
        });
    }

    // Promo code logic
    applyPromoBtn.addEventListener('click', () => {
        const promoCode = promoCodeInput.value.trim().toLowerCase();
        // Use the dataset values to calculate the total
        const total = parseFloat(payNowBtn.dataset.baseFare) + parseFloat(payNowBtn.dataset.taxes) + parseFloat(payNowBtn.dataset.convenienceFee);
        
        if (promoCode === 'flyhigh') {
            const discountAmount = 5000;
            const newTotal = total - discountAmount;
            document.getElementById('discount').textContent = `₹${discountAmount.toLocaleString('en-IN')}`;
            totalElement.textContent = `₹${newTotal.toLocaleString('en-IN')}`;
            promoMessage.textContent = 'Promo code "FLYHIGH" applied! You saved ₹5,000.';
            promoMessage.classList.remove('text-red');
            promoMessage.classList.add('text-green');
        } else {
            promoMessage.textContent = 'Invalid promo code. Please try again.';
            promoMessage.classList.remove('text-green');
            promoMessage.classList.add('text-red');
            document.getElementById('discount').textContent = `₹0`;
            totalElement.textContent = `₹${total.toLocaleString('en-IN')}`;
        }
    });

    // Pay Now button logic
    payNowBtn.addEventListener('click', () => {
        payNowBtn.disabled = true;
        payNowBtn.textContent = 'Processing...';
        paymentStatusMessage.textContent = 'Your payment is being processed. Redirecting...';
        paymentStatusMessage.style.color = 'var(--primary-blue)';

        // Get details from localStorage
        const bookingId = localStorage.getItem('currentBookingId');
        const flightId = localStorage.getItem('currentFlightId');
        const passenger = JSON.parse(localStorage.getItem('currentPassenger') || '{}');
        const seat = localStorage.getItem('currentSeat') || '';
        const total = localStorage.getItem('currentTotal') || '';
        const flight = JSON.parse(localStorage.getItem('flight_' + flightId) || '{}');
        
        console.log('Payment data:', { bookingId, flightId, passenger, seat, total, flight });

        // Generate random 10-digit booking reference
        const bookingRef = Math.floor(1000000000 + Math.random() * 9000000000).toString();

        // Store all details in localStorage for confirmation page
        const confirmationDetails = {
            bookingRef,
            bookingId,
            flightId,
            passenger,
            seat,
            total,
            flight,
            paymentStatus: 'confirmed',
            paidAt: new Date().toISOString()
        };
        
        console.log('Storing confirmation details:', confirmationDetails);
        localStorage.setItem('confirmationDetails', JSON.stringify(confirmationDetails));
        
        // Also store individual components for easier access
        localStorage.setItem('bookingRef', bookingRef);
        localStorage.setItem('bookingDetails', JSON.stringify({
            bookingId,
            flightId,
            passenger,
            seat,
            total,
            flight,
            paymentStatus: 'confirmed',
            paidAt: new Date().toISOString()
        }));

        // Redirect to confirmation.html
        setTimeout(() => {
            window.location.href = `confirmation.html?bookingRef=${bookingRef}`;
        }, 700);
    });

    messageCloseBtn.addEventListener('click', hideMessage);
});
