// Charter Service class to handle API interactions
class CharterService {
    constructor() {
        this.baseUrl = '/api/charter';
    }

    /**
     * Submit a charter request
     * @param {Object} data - The charter request data
     * @returns {Promise} - The response from the server
     */
    async submitRequest(data) {
        try {
            const response = await fetch(`${this.baseUrl}/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit charter request');
            }

            return result;
        } catch (error) {
            console.error('Charter request submission error:', error);
            throw error;
        }
    }

    /**
     * Get the status of a charter request
     * @param {string} requestId - The ID of the charter request
     * @returns {Promise} - The response from the server
     */
    async getRequestStatus(requestId) {
        try {
            const response = await fetch(`${this.baseUrl}/request/${requestId}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to get charter request status');
            }

            return result;
        } catch (error) {
            console.error('Charter status check error:', error);
            throw error;
        }
    }
}