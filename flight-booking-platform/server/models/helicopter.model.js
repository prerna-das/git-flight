const mongoose = require('mongoose');

const helicopterSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['h125', 'aw139', 'bell429']
    },
    registration: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    capacity: {
        passengers: {
            type: Number,
            required: true
        },
        baggage: {
            type: Number,  // in kg
            required: true
        }
    },
    specifications: {
        maxSpeed: Number,  // in knots
        range: Number,     // in nautical miles
        maxAltitude: Number,  // in feet
        engineType: String,
        engineCount: Number
    },
    features: [{
        type: String
    }],
    images: [{
        url: String,
        caption: String
    }],
    status: {
        type: String,
        enum: ['available', 'maintenance', 'reserved', 'in-use'],
        default: 'available'
    },
    maintenance: {
        lastCheck: Date,
        nextCheck: Date,
        flightHours: Number,
        notes: String
    },
    pricing: {
        baseRate: Number,  // per hour
        minimumHours: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    schedule: [{
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CharterRequest'
        },
        startTime: Date,
        endTime: Date
    }]
}, {
    timestamps: true
});

// Virtual for availability status
helicopterSchema.virtual('isAvailable').get(function() {
    return this.status === 'available';
});

// Method to check availability for a specific time period
helicopterSchema.methods.checkAvailability = async function(startTime, endTime) {
    if (this.status !== 'available') {
        return false;
    }

    const conflictingSchedule = this.schedule.find(booking => {
        return (startTime <= booking.endTime && endTime >= booking.startTime);
    });

    return !conflictingSchedule;
};

// Method to calculate price for a charter
helicopterSchema.methods.calculatePrice = function(hours) {
    const basePrice = this.pricing.baseRate * Math.max(hours, this.pricing.minimumHours);
    return basePrice;
};

const Helicopter = mongoose.model('Helicopter', helicopterSchema);

module.exports = Helicopter;