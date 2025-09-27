// Notification utility class for displaying messages
class NotificationUtil {
    /**
     * Show a success notification
     * @param {HTMLElement} container - The container to insert the notification
     * @param {Object} data - The notification data
     */
    static showSuccess(container, data) {
        const message = document.createElement('div');
        message.className = 'alert alert-success fade-in fixed top-4 right-4 z-50 max-w-md shadow-lg';
        message.innerHTML = `
            <div class="flex items-center p-4 bg-white rounded-lg border-l-4 border-green-500">
                <i class="fas fa-check-circle text-2xl text-green-500 mr-3"></i>
                <div>
                    <h4 class="font-bold text-gray-900">${data.title || 'Success!'}</h4>
                    <p class="text-gray-700">${data.message}</p>
                    ${data.requestId ? `<p class="text-sm text-gray-600 mt-1">Request ID: ${data.requestId}</p>` : ''}
                </div>
                <button class="ml-auto text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.insertAdjacentElement('beforebegin', message);
        this.animateAndRemove(message, 10000);
    }

    /**
     * Show an error notification
     * @param {HTMLElement} container - The container to insert the notification
     * @param {Object} data - The notification data
     */
    static showError(container, data) {
        const message = document.createElement('div');
        message.className = 'alert alert-error fade-in fixed top-4 right-4 z-50 max-w-md shadow-lg';
        message.innerHTML = `
            <div class="flex items-center p-4 bg-white rounded-lg border-l-4 border-red-500">
                <i class="fas fa-exclamation-circle text-2xl text-red-500 mr-3"></i>
                <div>
                    <h4 class="font-bold text-gray-900">${data.title || 'Error'}</h4>
                    <p class="text-gray-700">${data.message}</p>
                </div>
                <button class="ml-auto text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.insertAdjacentElement('beforebegin', message);
        this.animateAndRemove(message, 5000);
    }

    /**
     * Animate and remove a notification
     * @param {HTMLElement} element - The notification element
     * @param {number} duration - Duration in milliseconds before removal
     */
    static animateAndRemove(element, duration) {
        setTimeout(() => {
            element.classList.add('fade-out');
            setTimeout(() => element.remove(), 500);
        }, duration);
    }
}