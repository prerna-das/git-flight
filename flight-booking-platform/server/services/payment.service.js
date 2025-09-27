const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

class PaymentService {
    static async calculateCharterPrice(charterRequest) {
        try {
            const { helicopter } = charterRequest;
            const basePrice = helicopter.basePrice;

            // Calculate distance-based price
            const distancePrice = await this.calculateDistancePrice(
                charterRequest.pickupLocation,
                charterRequest.dropoffLocation
            );

            // Calculate passenger-based price
            const passengerPrice = this.calculatePassengerPrice(
                charterRequest.passengers,
                helicopter.capacity
            );

            // Calculate total price
            const totalPrice = basePrice + distancePrice + passengerPrice;

            return Math.round(totalPrice * 100); // Convert to cents for Stripe
        } catch (error) {
            logger.error('Calculate charter price error:', error);
            throw error;
        }
    }

    static async calculateDistancePrice(pickupLocation, dropoffLocation) {
        // TODO: Implement distance calculation using Google Maps API
        // For now, return a dummy value
        return 500; // $500
    }

    static calculatePassengerPrice(passengers, capacity) {
        // Additional charge per passenger
        const pricePerPassenger = 100; // $100
        return passengers * pricePerPassenger;
    }

    static async processPayment(paymentMethodId, amount, description) {
        try {
            // Create a payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: 'usd',
                payment_method: paymentMethodId,
                description,
                confirm: true,
                return_url: process.env.PAYMENT_RETURN_URL
            });

            return paymentIntent;
        } catch (error) {
            logger.error('Process payment error:', error);
            throw error;
        }
    }

    static async createCustomer(user, paymentMethodId) {
        try {
            const customer = await stripe.customers.create({
                email: user.email,
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId
                }
            });

            return customer;
        } catch (error) {
            logger.error('Create customer error:', error);
            throw error;
        }
    }

    static async refundPayment(paymentIntentId, amount) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount
            });

            return refund;
        } catch (error) {
            logger.error('Refund payment error:', error);
            throw error;
        }
    }

    static async createPaymentIntent(amount, currency = 'usd') {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency
            });

            return paymentIntent;
        } catch (error) {
            logger.error('Create payment intent error:', error);
            throw error;
        }
    }

    static async listPaymentMethods(customerId) {
        try {
            const paymentMethods = await stripe.paymentMethods.list({
                customer: customerId,
                type: 'card'
            });

            return paymentMethods.data;
        } catch (error) {
            logger.error('List payment methods error:', error);
            throw error;
        }
    }

    static async attachPaymentMethod(customerId, paymentMethodId) {
        try {
            const paymentMethod = await stripe.paymentMethods.attach(
                paymentMethodId,
                { customer: customerId }
            );

            return paymentMethod;
        } catch (error) {
            logger.error('Attach payment method error:', error);
            throw error;
        }
    }

    static async detachPaymentMethod(paymentMethodId) {
        try {
            const paymentMethod = await stripe.paymentMethods.detach(
                paymentMethodId
            );

            return paymentMethod;
        } catch (error) {
            logger.error('Detach payment method error:', error);
            throw error;
        }
    }
}

module.exports = PaymentService;