// Helicopter Services Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize pricing calculator
    initPricingCalculator();
    
    // Initialize booking forms
    initBookingForms();
    
    // Handle enquiry forms
    initEnquiryForms();
});

function initPricingCalculator() {
    const tourButtons = document.querySelectorAll('[data-tour-type]');
    tourButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tourType = this.dataset.tourType;
            const basePrice = getTourBasePrice(tourType);
            updatePriceDisplay(basePrice);
        });
    });
}

function getTourBasePrice(tourType) {
    const prices = {
        'city': 299,
        'airport': 499,
        'charter': 999,
        'events': 799
    };
    return prices[tourType] || 0;
}

function updatePriceDisplay(price) {
    const priceDisplay = document.querySelector('.price-display');
    if (priceDisplay) {
        priceDisplay.textContent = `$${price}`;
    }
}

function initBookingForms() {
    const bookingForms = document.querySelectorAll('.booking-form');
    bookingForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBookingSubmission(form);
        });
    });
}

function handleBookingSubmission(form) {
    // Collect form data
    const formData = new FormData(form);
    const bookingData = Object.fromEntries(formData.entries());

    // Validate form data
    if (validateBookingData(bookingData)) {
        // Submit to booking API
        submitBooking(bookingData)
            .then(response => {
                if (response.success) {
                    window.location.href = '/html/booking/confirmation.html';
                } else {
                    showError('Booking failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Booking error:', error);
                showError('An error occurred. Please try again later.');
            });
    }
}

function validateBookingData(data) {
    // Required fields
    const required = ['date', 'time', 'passengers', 'contactName', 'contactEmail'];
    
    for (const field of required) {
        if (!data[field]) {
            showError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            return false;
        }
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
        showError('Please enter a valid email address');
        return false;
    }

    // Validate passenger count
    const passengers = parseInt(data.passengers);
    if (isNaN(passengers) || passengers < 1 || passengers > 6) {
        showError('Please enter a valid number of passengers (1-6)');
        return false;
    }

    return true;
}

async function submitBooking(bookingData) {
    try {
        const response = await fetch('/api/helicopter/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function initEnquiryForms() {
    const enquiryForms = document.querySelectorAll('.enquiry-form');
    enquiryForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEnquirySubmission(form);
        });
    });
}

function handleEnquirySubmission(form) {
    // Collect form data
    const formData = new FormData(form);
    const enquiryData = Object.fromEntries(formData.entries());

    // Submit enquiry
    submitEnquiry(enquiryData)
        .then(response => {
            if (response.success) {
                showSuccess('Thank you for your enquiry. We will contact you shortly.');
                form.reset();
            } else {
                showError('Failed to submit enquiry. Please try again.');
            }
        })
        .catch(error => {
            console.error('Enquiry error:', error);
            showError('An error occurred. Please try again later.');
        });
}

async function submitEnquiry(enquiryData) {
    try {
        const response = await fetch('/api/helicopter/enquiries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(enquiryData)
        });

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function showError(message) {
    // Display error message to user
    const errorContainer = document.querySelector('.error-message');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

function showSuccess(message) {
    // Display success message to user
    const successContainer = document.querySelector('.success-message');
    if (successContainer) {
        successContainer.textContent = message;
        successContainer.style.display = 'block';
        setTimeout(() => {
            successContainer.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}