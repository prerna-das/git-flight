const express = require('express');
const { body } = require('express-validator');
const charterController = require('../controllers/charter.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const charterRequestValidation = [
    body('charterType').isIn(['private', 'business', 'tour', 'event']),
    body('charterDate').isDate().isAfter(),
    body('charterTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('departureLocation').trim().notEmpty(),
    body('destination').trim().notEmpty(),
    body('passengers').isInt({ min: 1, max: 15 }),
    body('helicopterType').isIn(['h125', 'aw139', 'bell429'])
];

// Public routes
router.get('/helicopters', charterController.getAllHelicopters);
router.get('/helicopters/:type', charterController.getHelicopterDetails);

// Protected routes
router.use(protect);

router.post('/request', charterRequestValidation, charterController.createRequest);
router.get('/requests', charterController.getUserRequests);
router.get('/requests/:id', charterController.getRequestDetails);
router.put('/requests/:id/cancel', charterController.cancelRequest);

// Payment routes
router.post('/requests/:id/payment-intent', charterController.createPaymentIntent);
router.post('/webhook', charterController.handleStripeWebhook);

// Staff/Admin routes
router.use(authorize(['staff', 'admin']));

router.get('/all-requests', charterController.getAllRequests);
router.put('/requests/:id/status', charterController.updateRequestStatus);
router.put('/requests/:id/assign', charterController.assignPilot);
router.post('/requests/:id/quote', charterController.provideQuote);
router.post('/requests/:id/notes', charterController.addNote);

// Document management
router.post('/requests/:id/documents', charterController.uploadDocument);
router.get('/requests/:id/documents', charterController.getDocuments);

// Schedule management
router.get('/schedule', charterController.getSchedule);
router.post('/schedule/check', charterController.checkAvailability);

module.exports = router;