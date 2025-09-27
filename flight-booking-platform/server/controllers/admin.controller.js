const Helicopter = require('../models/helicopter.model');
const CharterRequest = require('../models/charterRequest.model');
const User = require('../models/user.model');
const EmailService = require('../services/email.service');
const logger = require('../utils/logger');

exports.getDashboardStats = async (req, res) => {
    try {
        // Get counts
        const totalUsers = await User.countDocuments();
        const totalCharters = await CharterRequest.countDocuments();
        const totalHelicopters = await Helicopter.countDocuments();

        // Get recent charters
        const recentCharters = await CharterRequest.find()
            .populate('user', '-password')
            .populate('helicopter')
            .sort('-createdAt')
            .limit(5);

        // Get revenue stats
        const completedCharters = await CharterRequest.find({
            status: 'completed',
            'payment.paidAt': {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30))
            }
        });

        const totalRevenue = completedCharters.reduce(
            (sum, charter) => sum + (charter.payment?.amount || 0),
            0
        );

        // Get helicopter utilization
        const helicopters = await Helicopter.find().select('model reservations');
        const helicopterUtilization = helicopters.map(helicopter => ({
            model: helicopter.model,
            totalReservations: helicopter.reservations.length
        }));

        res.json({
            stats: {
                totalUsers,
                totalCharters,
                totalHelicopters,
                totalRevenue
            },
            recentCharters,
            helicopterUtilization
        });
    } catch (error) {
        logger.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard stats' });
    }
};

// Helicopter Management
exports.addHelicopter = async (req, res) => {
    try {
        const {
            model,
            registrationNumber,
            capacity,
            range,
            cruisingSpeed,
            basePrice,
            features,
            maintenanceSchedule
        } = req.body;

        // Check if helicopter with registration number already exists
        const existingHelicopter = await Helicopter.findOne({ registrationNumber });
        if (existingHelicopter) {
            return res.status(400).json({ message: 'Helicopter with this registration number already exists' });
        }

        const helicopter = await Helicopter.create({
            model,
            registrationNumber,
            capacity,
            range,
            cruisingSpeed,
            basePrice,
            features,
            maintenanceSchedule,
            isAvailable: true
        });

        res.status(201).json({
            success: true,
            helicopter
        });
    } catch (error) {
        logger.error('Add helicopter error:', error);
        res.status(500).json({ message: 'Server error while adding helicopter' });
    }
};

exports.updateHelicopter = async (req, res) => {
    try {
        const {
            model,
            capacity,
            range,
            cruisingSpeed,
            basePrice,
            features,
            maintenanceSchedule,
            isAvailable
        } = req.body;

        const helicopter = await Helicopter.findById(req.params.id);
        if (!helicopter) {
            return res.status(404).json({ message: 'Helicopter not found' });
        }

        helicopter.model = model || helicopter.model;
        helicopter.capacity = capacity || helicopter.capacity;
        helicopter.range = range || helicopter.range;
        helicopter.cruisingSpeed = cruisingSpeed || helicopter.cruisingSpeed;
        helicopter.basePrice = basePrice || helicopter.basePrice;
        helicopter.features = features || helicopter.features;
        helicopter.maintenanceSchedule = maintenanceSchedule || helicopter.maintenanceSchedule;
        helicopter.isAvailable = isAvailable !== undefined ? isAvailable : helicopter.isAvailable;

        await helicopter.save();

        res.json({
            success: true,
            helicopter
        });
    } catch (error) {
        logger.error('Update helicopter error:', error);
        res.status(500).json({ message: 'Server error while updating helicopter' });
    }
};

exports.deleteHelicopter = async (req, res) => {
    try {
        const helicopter = await Helicopter.findById(req.params.id);
        if (!helicopter) {
            return res.status(404).json({ message: 'Helicopter not found' });
        }

        // Check for active or pending charter requests
        const activeCharters = await CharterRequest.find({
            helicopter: helicopter._id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (activeCharters.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete helicopter with active charter requests' 
            });
        }

        await helicopter.remove();

        res.json({
            success: true,
            message: 'Helicopter deleted successfully'
        });
    } catch (error) {
        logger.error('Delete helicopter error:', error);
        res.status(500).json({ message: 'Server error while deleting helicopter' });
    }
};

// Maintenance Management
exports.scheduleHelicopterMaintenance = async (req, res) => {
    try {
        const { startDate, endDate, maintenanceType, notes } = req.body;

        const helicopter = await Helicopter.findById(req.params.id);
        if (!helicopter) {
            return res.status(404).json({ message: 'Helicopter not found' });
        }

        // Check for conflicting charter requests
        const conflictingCharters = await CharterRequest.find({
            helicopter: helicopter._id,
            status: { $in: ['pending', 'confirmed'] },
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        });

        if (conflictingCharters.length > 0) {
            return res.status(400).json({
                message: 'Maintenance schedule conflicts with existing charter requests'
            });
        }

        helicopter.maintenanceSchedule.push({
            startDate,
            endDate,
            maintenanceType,
            notes
        });

        helicopter.isAvailable = false;
        await helicopter.save();

        res.json({
            success: true,
            helicopter
        });
    } catch (error) {
        logger.error('Schedule maintenance error:', error);
        res.status(500).json({ message: 'Server error while scheduling maintenance' });
    }
};

// Reports
exports.generateRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const charters = await CharterRequest.find({
            status: 'completed',
            'payment.paidAt': {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).populate('helicopter').populate('user', '-password');

        const report = {
            totalRevenue: 0,
            charterCount: charters.length,
            helicopterRevenue: {},
            dailyRevenue: {}
        };

        charters.forEach(charter => {
            const amount = charter.payment?.amount || 0;
            report.totalRevenue += amount;

            // Per helicopter revenue
            const helicopterModel = charter.helicopter.model;
            if (!report.helicopterRevenue[helicopterModel]) {
                report.helicopterRevenue[helicopterModel] = 0;
            }
            report.helicopterRevenue[helicopterModel] += amount;

            // Daily revenue
            const date = charter.payment.paidAt.toISOString().split('T')[0];
            if (!report.dailyRevenue[date]) {
                report.dailyRevenue[date] = 0;
            }
            report.dailyRevenue[date] += amount;
        });

        res.json(report);
    } catch (error) {
        logger.error('Generate revenue report error:', error);
        res.status(500).json({ message: 'Server error while generating revenue report' });
    }
};

exports.generateUtilizationReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const helicopters = await Helicopter.find();
        const report = {
            totalFlights: 0,
            helicopterUtilization: [],
            popularRoutes: {}
        };

        for (const helicopter of helicopters) {
            const flights = await CharterRequest.find({
                helicopter: helicopter._id,
                status: 'completed',
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            });

            report.totalFlights += flights.length;

            // Helicopter utilization
            const utilization = {
                model: helicopter.model,
                registrationNumber: helicopter.registrationNumber,
                totalFlights: flights.length,
                flightHours: 0,
                revenue: 0
            };

            flights.forEach(flight => {
                utilization.flightHours += flight.duration || 0;
                utilization.revenue += flight.payment?.amount || 0;

                // Popular routes
                const route = `${flight.pickupLocation} - ${flight.dropoffLocation}`;
                if (!report.popularRoutes[route]) {
                    report.popularRoutes[route] = 0;
                }
                report.popularRoutes[route]++;
            });

            report.helicopterUtilization.push(utilization);
        }

        // Sort popular routes
        report.popularRoutes = Object.entries(report.popularRoutes)
            .sort(([,a], [,b]) => b - a)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

        res.json(report);
    } catch (error) {
        logger.error('Generate utilization report error:', error);
        res.status(500).json({ message: 'Server error while generating utilization report' });
    }
};