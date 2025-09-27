const CharterRequest = require('../models/charterRequest.model');
const Helicopter = require('../models/helicopter.model');
const EmailService = require('../services/email.service');
const PaymentService = require('../services/payment.service');
const logger = require('../utils/logger');

exports.createCharterRequest = async (req, res) => {
    try {
        const {
            pickupLocation,
            dropoffLocation,
            date,
            passengers,
            helicopterId,
            specialRequirements
        } = req.body;

        // Check helicopter availability
        const helicopter = await Helicopter.findById(helicopterId);
        if (!helicopter) {
            return res.status(404).json({ message: 'Helicopter not found' });
        }

        if (!helicopter.isAvailable) {
            return res.status(400).json({ message: 'Helicopter is not available for this date' });
        }

        // Create charter request
        const charterRequest = await CharterRequest.create({
            user: req.user.id,
            helicopter: helicopterId,
            pickupLocation,
            dropoffLocation,
            date,
            passengers,
            specialRequirements,
            status: 'pending'
        });

        // Mark helicopter as unavailable for the requested date
        helicopter.reservations.push({
            date,
            charterId: charterRequest._id
        });
        await helicopter.save();

        // Send confirmation email
        await EmailService.sendCharterRequestConfirmation(
            req.user.email,
            charterRequest
        );

        res.status(201).json({
            success: true,
            charterRequest
        });
    } catch (error) {
        logger.error('Create charter request error:', error);
        res.status(500).json({ message: 'Server error while creating charter request' });
    }
};

exports.getMyCharterRequests = async (req, res) => {
    try {
        const charterRequests = await CharterRequest.find({ user: req.user.id })
            .populate('helicopter')
            .sort('-createdAt');

        res.json(charterRequests);
    } catch (error) {
        logger.error('Get charter requests error:', error);
        res.status(500).json({ message: 'Server error while fetching charter requests' });
    }
};

exports.getCharterRequest = async (req, res) => {
    try {
        const charterRequest = await CharterRequest.findById(req.params.id)
            .populate('helicopter')
            .populate('user', '-password');

        if (!charterRequest) {
            return res.status(404).json({ message: 'Charter request not found' });
        }

        // Check if user is authorized to view this request
        if (charterRequest.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this request' });
        }

        res.json(charterRequest);
    } catch (error) {
        logger.error('Get charter request error:', error);
        res.status(500).json({ message: 'Server error while fetching charter request' });
    }
};

exports.updateCharterRequest = async (req, res) => {
    try {
        const {
            pickupLocation,
            dropoffLocation,
            date,
            passengers,
            specialRequirements
        } = req.body;

        const charterRequest = await CharterRequest.findById(req.params.id);
        if (!charterRequest) {
            return res.status(404).json({ message: 'Charter request not found' });
        }

        // Check if user is authorized to update this request
        if (charterRequest.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this request' });
        }

        // Only allow updates if status is pending
        if (charterRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot update confirmed or completed charter requests' });
        }

        charterRequest.pickupLocation = pickupLocation || charterRequest.pickupLocation;
        charterRequest.dropoffLocation = dropoffLocation || charterRequest.dropoffLocation;
        charterRequest.date = date || charterRequest.date;
        charterRequest.passengers = passengers || charterRequest.passengers;
        charterRequest.specialRequirements = specialRequirements || charterRequest.specialRequirements;

        await charterRequest.save();

        res.json({
            success: true,
            charterRequest
        });
    } catch (error) {
        logger.error('Update charter request error:', error);
        res.status(500).json({ message: 'Server error while updating charter request' });
    }
};

exports.cancelCharterRequest = async (req, res) => {
    try {
        const charterRequest = await CharterRequest.findById(req.params.id);
        if (!charterRequest) {
            return res.status(404).json({ message: 'Charter request not found' });
        }

        // Check if user is authorized to cancel this request
        if (charterRequest.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this request' });
        }

        // Only allow cancellation if status is pending
        if (charterRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot cancel confirmed or completed charter requests' });
        }

        // Update helicopter availability
        const helicopter = await Helicopter.findById(charterRequest.helicopter);
        if (helicopter) {
            helicopter.reservations = helicopter.reservations.filter(
                reservation => reservation.charterId.toString() !== charterRequest._id.toString()
            );
            await helicopter.save();
        }

        charterRequest.status = 'cancelled';
        await charterRequest.save();

        // Send cancellation email
        await EmailService.sendCharterCancellationEmail(
            req.user.email,
            charterRequest
        );

        res.json({
            success: true,
            message: 'Charter request cancelled successfully'
        });
    } catch (error) {
        logger.error('Cancel charter request error:', error);
        res.status(500).json({ message: 'Server error while cancelling charter request' });
    }
};

exports.processPayment = async (req, res) => {
    try {
        const { charterRequestId, paymentMethodId } = req.body;

        const charterRequest = await CharterRequest.findById(charterRequestId)
            .populate('helicopter');

        if (!charterRequest) {
            return res.status(404).json({ message: 'Charter request not found' });
        }

        // Check if user is authorized to pay for this request
        if (charterRequest.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to pay for this request' });
        }

        // Calculate price based on helicopter type and distance
        const price = await PaymentService.calculateCharterPrice(charterRequest);

        // Process payment
        const payment = await PaymentService.processPayment(
            paymentMethodId,
            price,
            `Charter flight from ${charterRequest.pickupLocation} to ${charterRequest.dropoffLocation}`
        );

        // Update charter request status
        charterRequest.status = 'confirmed';
        charterRequest.payment = {
            amount: price,
            paymentId: payment.id,
            paidAt: Date.now()
        };
        await charterRequest.save();

        // Send confirmation email
        await EmailService.sendPaymentConfirmation(
            req.user.email,
            charterRequest,
            payment
        );

        res.json({
            success: true,
            message: 'Payment processed successfully',
            charterRequest
        });
    } catch (error) {
        logger.error('Process payment error:', error);
        res.status(500).json({ message: 'Server error while processing payment' });
    }
};

// Admin only controllers
exports.getAllCharterRequests = async (req, res) => {
    try {
        const charterRequests = await CharterRequest.find()
            .populate('helicopter')
            .populate('user', '-password')
            .sort('-createdAt');

        res.json(charterRequests);
    } catch (error) {
        logger.error('Get all charter requests error:', error);
        res.status(500).json({ message: 'Server error while fetching charter requests' });
    }
};

exports.updateCharterStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const charterRequest = await CharterRequest.findById(req.params.id);
        if (!charterRequest) {
            return res.status(404).json({ message: 'Charter request not found' });
        }

        charterRequest.status = status;
        await charterRequest.save();

        // Send status update email
        await EmailService.sendCharterStatusUpdate(
            charterRequest.user.email,
            charterRequest
        );

        res.json({
            success: true,
            charterRequest
        });
    } catch (error) {
        logger.error('Update charter status error:', error);
        res.status(500).json({ message: 'Server error while updating charter status' });
    }
};