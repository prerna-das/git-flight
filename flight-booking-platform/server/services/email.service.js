const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
    static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    static async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to,
                subject,
                html
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            logger.error('Send email error:', error);
            throw error;
        }
    }

    static async sendVerificationEmail(email, token) {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
        const html = `
            <h1>Welcome to Helicopter Charter Service!</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>If you did not create an account, please ignore this email.</p>
        `;

        await this.sendEmail(email, 'Verify Your Email', html);
    }

    static async sendPasswordResetEmail(email, token) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        const html = `
            <h1>Password Reset Request</h1>
            <p>You are receiving this email because we received a password reset request for your account.</p>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>If you did not request a password reset, please ignore this email.</p>
        `;

        await this.sendEmail(email, 'Reset Your Password', html);
    }

    static async sendPasswordChangeConfirmation(email) {
        const html = `
            <h1>Password Changed Successfully</h1>
            <p>Your password has been changed successfully.</p>
            <p>If you did not change your password, please contact us immediately.</p>
        `;

        await this.sendEmail(email, 'Password Changed', html);
    }

    static async sendCharterRequestConfirmation(email, charterRequest) {
        const html = `
            <h1>Charter Request Confirmation</h1>
            <h2>Charter Details:</h2>
            <ul>
                <li>Pickup Location: ${charterRequest.pickupLocation}</li>
                <li>Dropoff Location: ${charterRequest.dropoffLocation}</li>
                <li>Date: ${new Date(charterRequest.date).toLocaleDateString()}</li>
                <li>Passengers: ${charterRequest.passengers}</li>
                <li>Status: ${charterRequest.status}</li>
            </ul>
            <p>Your charter request has been received and is pending confirmation.</p>
            <p>We will contact you shortly with further details.</p>
        `;

        await this.sendEmail(email, 'Charter Request Confirmation', html);
    }

    static async sendPaymentConfirmation(email, charterRequest, payment) {
        const html = `
            <h1>Payment Confirmation</h1>
            <h2>Charter Details:</h2>
            <ul>
                <li>Pickup Location: ${charterRequest.pickupLocation}</li>
                <li>Dropoff Location: ${charterRequest.dropoffLocation}</li>
                <li>Date: ${new Date(charterRequest.date).toLocaleDateString()}</li>
                <li>Amount Paid: $${(payment.amount / 100).toFixed(2)}</li>
                <li>Payment ID: ${payment.id}</li>
            </ul>
            <p>Thank you for your payment. Your charter request has been confirmed.</p>
            <p>We will send you further details about your charter shortly.</p>
        `;

        await this.sendEmail(email, 'Payment Confirmation', html);
    }

    static async sendCharterCancellationEmail(email, charterRequest) {
        const html = `
            <h1>Charter Request Cancelled</h1>
            <h2>Charter Details:</h2>
            <ul>
                <li>Pickup Location: ${charterRequest.pickupLocation}</li>
                <li>Dropoff Location: ${charterRequest.dropoffLocation}</li>
                <li>Date: ${new Date(charterRequest.date).toLocaleDateString()}</li>
            </ul>
            <p>Your charter request has been cancelled as requested.</p>
            <p>If you did not cancel this charter request, please contact us immediately.</p>
        `;

        await this.sendEmail(email, 'Charter Request Cancelled', html);
    }

    static async sendCharterStatusUpdate(email, charterRequest) {
        const html = `
            <h1>Charter Status Update</h1>
            <h2>Charter Details:</h2>
            <ul>
                <li>Pickup Location: ${charterRequest.pickupLocation}</li>
                <li>Dropoff Location: ${charterRequest.dropoffLocation}</li>
                <li>Date: ${new Date(charterRequest.date).toLocaleDateString()}</li>
                <li>New Status: ${charterRequest.status}</li>
            </ul>
            <p>Your charter request status has been updated.</p>
            ${charterRequest.status === 'confirmed' 
                ? '<p>Please proceed with the payment to secure your booking.</p>' 
                : ''}
            ${charterRequest.status === 'completed' 
                ? '<p>Thank you for choosing our service. We hope you enjoyed your flight!</p>' 
                : ''}
        `;

        await this.sendEmail(email, 'Charter Status Update', html);
    }

    static async sendMaintenanceNotification(email, helicopter, maintenance) {
        const html = `
            <h1>Helicopter Maintenance Scheduled</h1>
            <h2>Maintenance Details:</h2>
            <ul>
                <li>Helicopter Model: ${helicopter.model}</li>
                <li>Registration Number: ${helicopter.registrationNumber}</li>
                <li>Start Date: ${new Date(maintenance.startDate).toLocaleDateString()}</li>
                <li>End Date: ${new Date(maintenance.endDate).toLocaleDateString()}</li>
                <li>Type: ${maintenance.maintenanceType}</li>
                <li>Notes: ${maintenance.notes}</li>
            </ul>
            <p>The helicopter will not be available for charter during this period.</p>
        `;

        await this.sendEmail(email, 'Maintenance Schedule Notification', html);
    }

    static async sendLowUtilizationAlert(email, helicopter, utilization) {
        const html = `
            <h1>Low Helicopter Utilization Alert</h1>
            <h2>Helicopter Details:</h2>
            <ul>
                <li>Model: ${helicopter.model}</li>
                <li>Registration Number: ${helicopter.registrationNumber}</li>
                <li>Current Utilization: ${utilization.toFixed(2)}%</li>
            </ul>
            <p>This helicopter's utilization is below the target threshold.</p>
            <p>Please review pricing and marketing strategies to improve utilization.</p>
        `;

        await this.sendEmail(email, 'Low Utilization Alert', html);
    }
}

module.exports = EmailService;