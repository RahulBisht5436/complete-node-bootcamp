const mongoose = require("mongoose");

// Booking Schema: Stores information about a user's paid tour booking
const bookingSchema = new mongoose.Schema({
    // Reference to the booked tour
    // Stores the ObjectId of the Tour document
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a tour']
    },

    // Reference to the user who made the booking
    // Stores the ObjectId of the User document
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a user']
    },

    // Booking price stored directly to prevent historical price changes
    price: {
        type: Number,
        required: [true, 'Booking must have a price']
    },

    // Timestamp when booking is created
    createdAt: {
        type: Date,
        default: Date.now
    },

    // Payment status - set true once Stripe checkout is successful
    paid: {
        type: Boolean,
        default: true
    }
});

bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });
    next();
})

// Create Booking model
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
