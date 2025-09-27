const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/revenue', adminController.getRevenueStats);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Charter management
router.get('/charters/pending', adminController.getPendingCharters);
router.get('/charters/scheduled', adminController.getScheduledCharters);
router.get('/charters/completed', adminController.getCompletedCharters);

// Helicopter management
router.post('/helicopters', adminController.addHelicopter);
router.put('/helicopters/:id', adminController.updateHelicopter);
router.delete('/helicopters/:id', adminController.deleteHelicopter);
router.put('/helicopters/:id/maintenance', adminController.updateMaintenanceStatus);

// Pilot management
router.get('/pilots', adminController.getPilots);
router.post('/pilots/assign', adminController.assignPilotToCharter);
router.get('/pilots/schedule', adminController.getPilotSchedule);

// Document management
router.get('/documents/pending', adminController.getPendingDocuments);
router.put('/documents/:id/approve', adminController.approveDocument);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Reports
router.get('/reports/revenue', adminController.generateRevenueReport);
router.get('/reports/usage', adminController.generateUsageReport);
router.get('/reports/maintenance', adminController.generateMaintenanceReport);

module.exports = router;