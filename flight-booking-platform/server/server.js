const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const Joi = require('joi');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Charter request validation schema
const charterRequestSchema = Joi.object({
    charterType: Joi.string().required().valid('private', 'business', 'tour', 'event'),
    charterDate: Joi.date().greater('now').required(),
    charterTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    departureLocation: Joi.string().required().min(2).max(100),
    destination: Joi.string().required().min(2).max(100),
    passengers: Joi.number().integer().min(1).max(15).required(),
    helicopterType: Joi.string().required().valid('h125', 'aw139', 'bell429'),
    specialRequirements: Joi.string().allow('').max(1000)
});

// Setup email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// In-memory storage for charter requests (replace with database in production)
const charterRequests = new Map();

// Routes
app.post('/api/charter/request', async (req, res) => {
    try {
        // Validate request body
        const { error, value } = charterRequestSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data',
                errors: error.details.map(err => err.message)
            });
        }

        // Generate unique ID for the request
        const requestId = uuidv4();
        const timestamp = new Date();

        // Store the charter request
        const charterRequest = {
            id: requestId,
            timestamp,
            status: 'pending',
            ...value
        };
        charterRequests.set(requestId, charterRequest);

        // Send email notification
        const emailContent = `
            New Charter Request (ID: ${requestId})
            
            Type: ${value.charterType}
            Date: ${value.charterDate}
            Time: ${value.charterTime}
            From: ${value.departureLocation}
            To: ${value.destination}
            Passengers: ${value.passengers}
            Helicopter: ${value.helicopterType}
            Special Requirements: ${value.specialRequirements || 'None'}
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'bookings@travelair.com',
            to: process.env.EMAIL_TO || 'charter@travelair.com',
            subject: `New Charter Request - ${value.charterType}`,
            text: emailContent
        });

        // Send confirmation email to customer (if email provided)
        if (req.body.email) {
            const customerEmailContent = `
                Thank you for your charter request!
                
                We have received your request for a ${value.charterType} charter on ${value.charterDate} at ${value.charterTime}.
                Our team will review your request and contact you shortly with a quote.
                
                Request Details:
                - From: ${value.departureLocation}
                - To: ${value.destination}
                - Passengers: ${value.passengers}
                - Helicopter: ${value.helicopterType}
                
                Your request ID is: ${requestId}
                
                If you have any questions, please contact us at +1 (555) 123-4567 or reply to this email.
                
                Best regards,
                TravelAir Charter Team
            `;

            await transporter.sendMail({
                from: process.env.EMAIL_FROM || 'bookings@travelair.com',
                to: req.body.email,
                subject: 'Charter Request Confirmation - TravelAir',
                text: customerEmailContent
            });
        }

        res.status(201).json({
            success: true,
            message: 'Charter request received successfully',
            requestId,
            status: 'pending'
        });

    } catch (error) {
        console.error('Error processing charter request:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request'
        });
    }
});

// Get charter request status
app.get('/api/charter/request/:id', (req, res) => {
    const requestId = req.params.id;
    const request = charterRequests.get(requestId);

    if (!request) {
        return res.status(404).json({
            success: false,
            message: 'Charter request not found'
        });
    }

    res.json({
        success: true,
        request
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});