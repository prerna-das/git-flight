// Booking functionality
class BookingSystem {
    constructor() {
        this.stripe = Stripe('your_publishable_key'); // Replace with your Stripe key
        this.currentStep = 1;
        this.bookingData = {};
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.setupAutocomplete();
        this.initializePaymentSystem();
    }

    initializeEventListeners() {
        // Flight selection
        document.querySelectorAll('.flight-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleFlightSelection(e));
        });

        // Seat selection
        document.querySelectorAll('.seat').forEach(seat => {
            seat.addEventListener('click', (e) => this.handleSeatSelection(e));
        });

        // Form navigation
        document.querySelectorAll('.booking-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNavigation(e));
        });
    }

    setupAutocomplete() {
        // Airport/City autocomplete
        const airports = ['New York (JFK)', 'London (LHR)', 'Paris (CDG)', 'Tokyo (HND)'];
        
        const departureInput = document.getElementById('departure');
        const arrivalInput = document.getElementById('arrival');

        if (departureInput && arrivalInput) {
            this.setupAutocompleteSingle(departureInput, airports);
            this.setupAutocompleteSingle(arrivalInput, airports);
        }
    }

    setupAutocompleteSingle(input, items) {
        const wrapper = document.createElement('div');
        wrapper.className = 'relative';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const dropdown = document.createElement('div');
        dropdown.className = 'absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-lg hidden';
        wrapper.appendChild(dropdown);

        input.addEventListener('input', () => {
            const value = input.value.toLowerCase();
            const matches = items.filter(item => 
                item.toLowerCase().includes(value)
            );

            dropdown.innerHTML = '';
            if (matches.length > 0 && value.length > 0) {
                matches.forEach(match => {
                    const div = document.createElement('div');
                    div.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
                    div.textContent = match;
                    div.addEventListener('click', () => {
                        input.value = match;
                        dropdown.classList.add('hidden');
                    });
                    dropdown.appendChild(div);
                });
                dropdown.classList.remove('hidden');
            } else {
                dropdown.classList.add('hidden');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    async handleFlightSelection(e) {
        const card = e.currentTarget;
        const flightId = card.dataset.flightId;
        
        try {
            const response = await fetch(`/api/flights/${flightId}`);
            const flightData = await response.json();
            
            this.bookingData.flight = flightData;
            this.updateBookingSummary();
            this.nextStep();
        } catch (error) {
            console.error('Error fetching flight details:', error);
            this.showError('Unable to select flight. Please try again.');
        }
    }

    handleSeatSelection(e) {
        const seat = e.currentTarget;
        if (seat.classList.contains('occupied')) {
            return;
        }

        document.querySelectorAll('.seat.selected').forEach(s => {
            s.classList.remove('selected');
        });

        seat.classList.add('selected');
        this.bookingData.seat = seat.dataset.seatNumber;
        this.updateBookingSummary();
    }

    handleNavigation(e) {
        const direction = e.currentTarget.dataset.direction;
        if (direction === 'next') {
            this.nextStep();
        } else {
            this.previousStep();
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.hideStep(this.currentStep);
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgressBar();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.hideStep(this.currentStep);
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgressBar();
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1: // Flight selection
                return this.bookingData.flight != null;
            case 2: // Passenger details
                return this.validatePassengerDetails();
            case 3: // Seat selection
                return this.bookingData.seat != null;
            case 4: // Payment
                return this.validatePaymentDetails();
            default:
                return true;
        }
    }

    validatePassengerDetails() {
        const required = ['firstName', 'lastName', 'email', 'phone'];
        return required.every(field => {
            const input = document.getElementById(field);
            return input && input.value.trim() !== '';
        });
    }

    validatePaymentDetails() {
        // Implement payment validation
        return true;
    }

    hideStep(step) {
        document.querySelector(`.booking-step[data-step="${step}"]`)
            ?.classList.add('hidden');
    }

    showStep(step) {
        document.querySelector(`.booking-step[data-step="${step}"]`)
            ?.classList.remove('hidden');
    }

    updateProgressBar() {
        const progress = (this.currentStep - 1) * 25; // 4 steps = 25% each
        document.querySelector('.progress-bar-inner').style.width = `${progress}%`;
    }

    updateBookingSummary() {
        const summary = document.querySelector('.booking-summary');
        if (!summary) return;

        const { flight, seat } = this.bookingData;
        
        summary.innerHTML = `
            <div class="p-4 bg-gray-50 rounded-lg">
                <h3 class="font-semibold mb-4">Booking Summary</h3>
                ${flight ? `
                    <div class="mb-3">
                        <p class="text-sm text-gray-600">Flight</p>
                        <p class="font-medium">${flight.number} - ${flight.from} to ${flight.to}</p>
                    </div>
                    <div class="mb-3">
                        <p class="text-sm text-gray-600">Date</p>
                        <p class="font-medium">${new Date(flight.departureTime).toLocaleDateString()}</p>
                    </div>
                ` : ''}
                ${seat ? `
                    <div class="mb-3">
                        <p class="text-sm text-gray-600">Seat</p>
                        <p class="font-medium">${seat}</p>
                    </div>
                ` : ''}
                ${flight ? `
                    <div class="mt-4 pt-4 border-t">
                        <div class="flex justify-between">
                            <span>Total</span>
                            <span class="font-semibold">$${flight.price}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    async initializePaymentSystem() {
        try {
            const elements = this.stripe.elements();
            const card = elements.create('card');
            card.mount('#card-element');

            card.addEventListener('change', (event) => {
                const displayError = document.getElementById('card-errors');
                if (event.error) {
                    displayError.textContent = event.error.message;
                } else {
                    displayError.textContent = '';
                }
            });

            const form = document.getElementById('payment-form');
            form?.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.handlePaymentSubmission(card);
            });
        } catch (error) {
            console.error('Error initializing payment system:', error);
        }
    }

    async handlePaymentSubmission(card) {
        const form = document.getElementById('payment-form');
        const submitButton = form.querySelector('button[type="submit"]');
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';

            const { token, error } = await this.stripe.createToken(card);

            if (error) {
                const errorElement = document.getElementById('card-errors');
                errorElement.textContent = error.message;
                submitButton.disabled = false;
                submitButton.textContent = 'Pay Now';
                return;
            }

            // Send payment to server
            const response = await this.processPayment(token);
            
            if (response.success) {
                this.showSuccess('Payment successful! Redirecting to confirmation...');
                setTimeout(() => {
                    window.location.href = '/booking/confirmation';
                }, 2000);
            } else {
                throw new Error(response.message || 'Payment failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            this.showError('Payment failed. Please try again.');
            submitButton.disabled = false;
            submitButton.textContent = 'Pay Now';
        }
    }

    async processPayment(token) {
        try {
            const response = await fetch('/api/payments/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: token.id,
                    booking: this.bookingData
                })
            });

            return await response.json();
        } catch (error) {
            throw new Error('Payment processing failed');
        }
    }

    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.textContent = message;
        
        document.querySelector('.booking-container').prepend(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.textContent = message;
        
        document.querySelector('.booking-container').prepend(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Initialize booking system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BookingSystem();
});