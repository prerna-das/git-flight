// Main JavaScript file
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeBookingForms();
    initializeAnimations();
    initializeUserInterface();
});

// Navigation functionality
function initializeNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const userMenu = document.getElementById('userMenu');
    const searchBtn = document.getElementById('searchBtn');

    // Mobile menu toggle
    mobileMenuBtn?.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // User menu dropdown
    userMenu?.addEventListener('click', (e) => {
        const dropdown = userMenu.querySelector('div');
        dropdown.classList.toggle('hidden');
        e.stopPropagation();
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        const dropdown = userMenu?.querySelector('div');
        if (dropdown && !dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Booking forms functionality
function initializeBookingForms() {
    const tabButtons = document.querySelectorAll('.btn-tab');
    const forms = {
        flights: document.getElementById('flightSearchForm'),
        'private-jets': document.getElementById('privateJetForm'),
        helicopters: document.getElementById('helicopterForm')
    };

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show appropriate form
            const formType = button.dataset.tab;
            Object.keys(forms).forEach(key => {
                if (forms[key]) {
                    forms[key].style.display = key === formType ? 'block' : 'none';
                }
            });
        });
    });

    // Form submission handling
    Object.values(forms).forEach(form => {
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    
                    // Show loading state
                    form.querySelector('button[type="submit"]').disabled = true;
                    form.querySelector('button[type="submit"]').innerHTML = 'Searching...';

                    // Make API call
                    const response = await searchFlights(data);
                    
                    // Handle response
                    handleSearchResponse(response);
                } catch (error) {
                    showError('An error occurred while searching. Please try again.');
                } finally {
                    // Reset button state
                    form.querySelector('button[type="submit"]').disabled = false;
                    form.querySelector('button[type="submit"]').innerHTML = 'Search Flights';
                }
            });
        }
    });
}

// Animation functionality
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeIn');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe elements that should animate on scroll
    document.querySelectorAll('.should-animate').forEach(el => {
        observer.observe(el);
    });
}

// User Interface enhancements
function initializeUserInterface() {
    // Dynamic input labels
    document.querySelectorAll('.input-field').forEach(input => {
        const label = input.previousElementSibling;
        if (label && label.tagName === 'LABEL') {
            input.addEventListener('focus', () => {
                label.classList.add('active');
            });
            input.addEventListener('blur', () => {
                if (!input.value) {
                    label.classList.remove('active');
                }
            });
            // Initialize if input has value
            if (input.value) {
                label.classList.add('active');
            }
        }
    });

    // Tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = el.dataset.tooltip;
            document.body.appendChild(tooltip);
            
            const rect = el.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
        });
        
        el.addEventListener('mouseleave', () => {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// API calls
async function searchFlights(searchData) {
    try {
        const response = await fetch('/api/flights/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchData)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error searching flights:', error);
        throw error;
    }
}

// UI Helpers
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    alert.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function handleSearchResponse(response) {
    // Implementation for handling search results
    console.log('Search response:', response);
    // TODO: Update UI with search results
}