// src/routes/index.js

const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');

const bookingController = new BookingController();

// Route to search for flights
router.get('/flights', bookingController.searchFlights);

// Route to book a flight
router.post('/flights/book', bookingController.bookFlight);

// Route to search for helicopters
router.get('/helicopters', bookingController.searchHelicopters);

// Route to book a helicopter
router.post('/helicopters/book', bookingController.bookHelicopter);

module.exports = router;