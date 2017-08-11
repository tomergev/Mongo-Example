const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ReservationGuestModel = require('./reservationGuest')
const RevenueMetrics = require('./revenueMetrics')


const reservationSchema = new Schema({
    reservationGuests: [ReservationGuestModel.schema],
    reservationDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    reservationEndDate: {
        type: Date,
    },
    guestCount: {
        type: Number
    },
    reservationStatus: {
        type: String,
        enum: ['Available', 'Reserved', 'Pending', 'Checked Out', 'Checked In', 'Maintenance', 'Finalized', 'Invoiced']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',
        required: true
    },
    metrics: {
        type: RevenueMetrics.schema,
        required: true
    },
    expectedDuration: {
        type: Number,
        required: true
    },
    hourlyRate: {
        type: Number
    },
    expectedCost: {
        type: Number
    },
    source: {
        type: String,
        enum: ['Helm', 'Consumer']
    },
    stripeTransaction: {
        chargeId: {
            type: String
        },
        amountPaid: {
            type: Number
        }
    }
},
    {
        timestamps: true
    });

reservationSchema.pre('save', function (next) {
    let durationMiliSeconds = this.expectedDuration * 60 * 60 * 1000
    this.reservationEndDate = new Date(this.reservationDate.getTime() + durationMiliSeconds)
    next();
})

module.exports = mongoose.model('Reservation', reservationSchema);

