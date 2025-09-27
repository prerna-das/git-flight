const mongoose = require('mongoose');

const charterRequestSchema = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    charterType: {
        type: String,
        required: true,
        enum: ['private', 'business', 'tour', 'event']
    },
    charterDate: {
        type: Date,
        required: true
    },
    charterTime: {
        type: String,
        required: true
    },
    departureLocation: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    passengers: {
        type: Number,
        required: true,
        min: 1,
        max: 15
    },
    helicopterType: {
        type: String,
        required: true,
        enum: ['h125', 'aw139', 'bell429']
    },
    specialRequirements: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    quote: {
        amount: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        validUntil: Date
    },
    payment: {
        status: {
            type: String,
            enum: ['pending', 'paid', 'refunded', 'failed'],
            default: 'pending'
        },
        stripePaymentIntentId: String,
        amount: Number,
        currency: String,
        paidAt: Date
    },
    assignedPilot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    schedule: {
        confirmationDeadline: Date,
        checkInTime: Date,
        estimatedDuration: Number
    },
    weather: {
        forecast: Object,
        lastUpdated: Date
    },
    notes: [{
        content: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    documents: [{
        type: {
            type: String,
            enum: ['contract', 'insurance', 'waiver', 'other']
        },
        url: String,
        name: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
charterRequestSchema.index({ requestId: 1 });
charterRequestSchema.index({ status: 1 });
charterRequestSchema.index({ charterDate: 1 });
charterRequestSchema.index({ 'payment.status': 1 });

// Virtual for formatted charter time
charterRequestSchema.virtual('formattedCharterTime').get(function() {
    return this.charterTime.replace(/:/, 'h') + 'm';
});

// Method to calculate estimated price
charterRequestSchema.methods.calculateEstimatedPrice = function() {
    const baseRates = {
        h125: 1500,  // per hour
        aw139: 3000,
        bell429: 2500
    };
    
    // Add implementation here
    return baseRates[this.helicopterType];
};

// Method to check availability
charterRequestSchema.methods.checkAvailability = async function() {
    // Add implementation here
    return true;
};

const CharterRequest = mongoose.model('CharterRequest', charterRequestSchema);

module.exports = CharterRequest;