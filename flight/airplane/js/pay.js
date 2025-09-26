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

    // Simulate loading booking details
    setTimeout(() => {
        document.getElementById('booking-header').textContent = 'Booking Details';
        summaryLoading.style.display = 'none';
        fareDetails.style.display = 'block';
        bookingDetailsSection.style.display = 'block';
        
        // Simulate fare calculation
        const baseFare = 55000;
        const taxes = 8500;
        const convenienceFee = 1500;
        let discount = 0;
        let total = baseFare + taxes + convenienceFee;

        document.getElementById('fare').textContent = `₹${baseFare.toLocaleString('en-IN')}`;
        document.getElementById('fee').textContent = `₹${taxes.toLocaleString('en-IN')}`;
        document.getElementById('convenience').textContent = `₹${convenienceFee.toLocaleString('en-IN')}`;
        document.getElementById('discount').textContent = `₹${discount.toLocaleString('en-IN')}`;
        totalElement.textContent = `₹${total.toLocaleString('en-IN')}`;

        // Set dataset values for the promo code and pay button logic
        payNowBtn.dataset.baseFare = baseFare;
        payNowBtn.dataset.taxes = taxes;
        payNowBtn.dataset.convenienceFee = convenienceFee;

        payNowBtn.disabled = false;
    }, 2000);

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

        // Get booking details from sessionStorage
        const bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails')) || {};
        const passengerDetails = JSON.parse(sessionStorage.getItem('passengerDetails')) || {};
        
        // Create a booking reference
        const bookingRef = 'BK' + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        // Store the booking reference
        sessionStorage.setItem('bookingReference', bookingRef);
        
        // Navigate to the confirmation page with query parameters
        setTimeout(() => {
            const params = new URLSearchParams({
                bookingId: bookingRef,
                from: bookingDetails.from || '',
                to: bookingDetails.to || '',
                date: bookingDetails.date || '',
                flightNumber: bookingDetails.flightNumber || '',
                passengerName: passengerDetails.name || '',
                seat: passengerDetails.seat || 'TBD',
                departure: bookingDetails.departure || '',
                arrival: bookingDetails.arrival || ''
            });
            window.location.href = `confirmation.html?${params.toString()}`;
        }, 500);
    });

    messageCloseBtn.addEventListener('click', hideMessage);
});
