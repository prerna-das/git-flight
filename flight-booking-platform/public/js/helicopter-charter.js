// Helicopter Charter Booking Handler
class CharterBooking {
    constructor() {
        this.form = document.querySelector('#booking form');
        this.loadingStates = {};
        this.initializeForm();
        this.initializeLoadingStates();
    }

    initializeForm() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
            
            // Add input validation listeners
            const inputs = this.form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', this.validateField.bind(this));
                input.addEventListener('input', this.clearError.bind(this));
            });
        }
    }

    initializeLoadingStates() {
        // Add loading spinner to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            const originalContent = button.innerHTML;
            this.loadingStates[button] = {
                original: originalContent,
                loading: `<span class="spinner mr-2"></span>${originalContent}`
            };
        });
    }

    validateField(event) {
        const input = event.target;
        const value = input.value.trim();

        // Remove any existing error messages
        this.clearError(event);

        // Validate based on input type
        switch(input.type) {
            case 'date':
                if (!this.isValidDate(value)) {
                    this.showError(input, 'Please select a valid future date');
                }
                break;
            case 'time':
                if (!this.isValidTime(value)) {
                    this.showError(input, 'Please select a valid time');
                }
                break;
            case 'number':
                const min = parseInt(input.getAttribute('min'));
                const max = parseInt(input.getAttribute('max'));
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < min || numValue > max) {
                    this.showError(input, `Please enter a number between ${min} and ${max}`);
                }
                break;
            case 'select-one':
                if (!value) {
                    this.showError(input, 'Please select an option');
                }
                break;
            default:
                if (!value) {
                    this.showError(input, 'This field is required');
                }
        }
    }

    isValidDate(dateString) {
        const selectedDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
    }

    isValidTime(timeString) {
        return timeString.length > 0;
    }

    showError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        input.classList.add('border-red-500');
        input.parentNode.appendChild(errorDiv);
    }

    clearError(event) {
        const input = event.target;
        const errorDiv = input.parentNode.querySelector('.text-red-500');
        if (errorDiv) {
            errorDiv.remove();
            input.classList.remove('border-red-500');
        }
    }

    setLoading(button, isLoading) {
        if (this.loadingStates[button]) {
            button.innerHTML = isLoading ? this.loadingStates[button].loading : this.loadingStates[button].original;
            button.disabled = isLoading;
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const submitButton = this.form.querySelector('button[type="submit"]');
        
        // Validate all fields before submission
        const inputs = this.form.querySelectorAll('input, select, textarea');
        let isValid = true;
        inputs.forEach(input => {
            const event = new Event('blur');
            input.dispatchEvent(event);
            if (input.parentNode.querySelector('.text-red-500')) {
                isValid = false;
            }
        });

        if (!isValid) {
            return;
        }

        // Collect form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        try {
            this.setLoading(submitButton, true);

            // Make API call to submit charter request
            const response = await fetch('/api/charter/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to submit charter request');
            }

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.textContent = 'Thank you for your charter request. Our team will contact you shortly with a quote.';
            this.form.insertAdjacentElement('beforebegin', successMessage);

            // Reset form
            this.form.reset();

            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth' });

            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);

        } catch (error) {
            console.error('Error submitting charter request:', error);
            
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-error';
            errorMessage.textContent = 'An error occurred while submitting your request. Please try again later.';
            this.form.insertAdjacentElement('beforebegin', errorMessage);

            // Remove error message after 5 seconds
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);

        } finally {
            this.setLoading(submitButton, false);
        }
    }
}

// Navigation Handler
class Navigation {
    constructor() {
        this.navigationContainer = document.getElementById('navigation');
        this.footerContainer = document.getElementById('footer');
        this.initializeNavigation();
    }

    async initializeNavigation() {
        try {
            // Show loading state
            this.showLoadingState();

            // Fetch layout template
            const response = await fetch('/html/layout.html');
            if (!response.ok) {
                throw new Error('Failed to load layout');
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Insert navigation and footer
            const nav = doc.querySelector('nav');
            const footer = doc.querySelector('footer');

            if (nav && this.navigationContainer) {
                this.navigationContainer.innerHTML = '';
                this.navigationContainer.appendChild(nav.cloneNode(true));
            }

            if (footer && this.footerContainer) {
                this.footerContainer.innerHTML = '';
                this.footerContainer.appendChild(footer.cloneNode(true));
            }

            // Initialize mobile menu
            this.initializeMobileMenu();

            // Highlight active navigation item
            this.highlightActiveNavItem();

        } catch (error) {
            console.error('Error loading navigation:', error);
            this.showErrorState();
        }
    }

    showLoadingState() {
        if (this.navigationContainer) {
            this.navigationContainer.innerHTML = `
                <div class="fixed top-0 left-0 right-0 bg-white shadow-md z-50 h-16 flex items-center justify-center">
                    <div class="spinner"></div>
                </div>
            `;
        }
    }

    showErrorState() {
        if (this.navigationContainer) {
            this.navigationContainer.innerHTML = `
                <div class="fixed top-0 left-0 right-0 bg-white shadow-md z-50 h-16 flex items-center justify-center text-red-500">
                    <p>Error loading navigation. Please refresh the page.</p>
                </div>
            `;
        }
    }

    initializeMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                }
            });
        }
    }

    highlightActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize charter booking
    const charterBooking = new CharterBooking();
    
    // Initialize navigation
    const navigation = new Navigation();

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.fade-in');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('visible');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check
});