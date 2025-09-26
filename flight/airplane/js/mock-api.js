// Mock API implementation for testing

// Store mock data in session storage to persist across page loads
function initializeMockData() {
    if (!sessionStorage.getItem('mockDataInitialized')) {
        const mockFlights = {
            'FL123': {
                flightId: 'FL123',
                flightName: 'Air India',
                flightNumber: 'AI-101',
                origin: 'Mumbai (BOM)',
                destination: 'Delhi (DEL)',
                date: '2025-10-15',
                departureTime: '08:00 AM',
                arrivalTime: '10:15 AM',
                price: 4500,
                gate: 'A12',
                boardingTime: '07:30 AM'
            },
            'FL124': {
                flightId: 'FL124',
                flightName: 'IndiGo',
                flightNumber: '6E-456',
                origin: 'Bangalore (BLR)',
                destination: 'Mumbai (BOM)',
                date: '2025-10-16',
                departureTime: '02:30 PM',
                arrivalTime: '04:15 PM',
                price: 3800,
                gate: 'B05',
                boardingTime: '02:00 PM'
            }
        };

        const mockBookings = {
            'BOOK123': {
                bookingId: 'BOOK123',
                flightId: 'FL123',
                passenger: {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    phone: '+919876543210',
                    age: 35,
                    aadhar: '1234-5678-9012',
                    address: '123 Main St, Mumbai',
                    gender: 'Male'
                },
                seat: '12A',
                paymentStatus: 'confirmed'
            },
            'BOOK124': {
                bookingId: 'BOOK124',
                flightId: 'FL124',
                passenger: {
                    name: 'Jane Smith',
                    email: 'jane.smith@example.com',
                    phone: '+919876543211',
                    age: 28,
                    aadhar: '9876-5432-1098',
                    address: '456 Park Ave, Bangalore',
                    gender: 'Female'
                },
                seat: '15F',
                paymentStatus: 'pending'
            }
        };

        sessionStorage.setItem('mockFlights', JSON.stringify(mockFlights));
        sessionStorage.setItem('mockBookings', JSON.stringify(mockBookings));
        sessionStorage.setItem('mockDataInitialized', 'true');
    }
}

// Mock fetch implementation
async function mockFetch(url, options = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const urlObj = new URL(url, window.location.origin);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Handle flight details request
    if (pathParts[0] === 'api' && pathParts[1] === 'flights' && pathParts[2]) {
        const flightId = pathParts[2];
        const mockFlights = JSON.parse(sessionStorage.getItem('mockFlights') || '{}');
        const flight = mockFlights[flightId];
        
        if (flight) {
            return {
                ok: true,
                status: 200,
                json: async () => flight,
                text: async () => JSON.stringify(flight)
            };
        } else {
            return {
                ok: false,
                status: 404,
                json: async () => ({ error: 'Flight not found' }),
                text: async () => JSON.stringify({ error: 'Flight not found' })
            };
        }
    }
    
    // Handle booking details request
    if (pathParts[0] === 'api' && pathParts[1] === 'bookings' && pathParts[2]) {
        const bookingId = pathParts[2];
        const mockBookings = JSON.parse(sessionStorage.getItem('mockBookings') || '{}');
        const booking = mockBookings[bookingId];
        
        if (booking) {
            return {
                ok: true,
                status: 200,
                json: async () => booking,
                text: async () => JSON.stringify(booking)
            };
        } else {
            return {
                ok: false,
                status: 404,
                json: async () => ({ error: 'Booking not found' }),
                text: async () => JSON.stringify({ error: 'Booking not found' })
            };
        }
    }
    
    // Handle payment request
    if (pathParts[0] === 'api' && pathParts[1] === 'bookings' && pathParts[3] === 'payment' && options.method === 'POST') {
        const bookingId = pathParts[2];
        const mockBookings = JSON.parse(sessionStorage.getItem('mockBookings') || '{}');
        
        if (mockBookings[bookingId]) {
            // Update payment status
            mockBookings[bookingId].paymentStatus = 'confirmed';
            sessionStorage.setItem('mockBookings', JSON.stringify(mockBookings));
            
            return {
                ok: true,
                status: 200,
                json: async () => ({ success: true }),
                text: async () => JSON.stringify({ success: true })
            };
        } else {
            return {
                ok: false,
                status: 404,
                json: async () => ({ error: 'Booking not found' }),
                text: async () => JSON.stringify({ error: 'Booking not found' })
            };
        }
    }
    
    // Default 404 response
    return {
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
        text: async () => JSON.stringify({ error: 'Not found' })
    };
}

// Initialize mock data when the script loads
initializeMockData();

// Override the global fetch function for testing
window.originalFetch = window.fetch;
window.fetch = async function(url, options) {
    // Only mock API requests
    if (url.startsWith('/api/')) {
        return mockFetch(url, options);
    }
    // Use the original fetch for other requests
    return window.originalFetch(url, options);
};
