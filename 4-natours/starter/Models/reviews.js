// --------------------------------------
// IMPORTS
// --------------------------------------
const mongoose = require('mongoose');

// --------------------------------------
// REVIEW SCHEMA
// --------------------------------------
// This schema stores all reviews given by users for tours.
// Each review is linked to: 
//    - A Tour (tour field)
//    - A User (user field)
// We also prevent empty reviews and enforce rating boundaries.
const reviewSchema = new mongoose.Schema(
    {
        // Review text
        review: {
            type: String,
            required: [true, "Review cannot be empty"],
            trim: true
        },

        // Rating between 1 and 5
        rating: {
            type: Number,
            min: 1,
            max: 5
        },

        // Auto-set review creation timestamp
        createdAt: {
            type: Date,
            default: Date.now
        },

        // The tour this review belongs to
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, "Review must belong to a tour"]
        },

        // The user who wrote the review
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, "Review must belong to a user"]
        }
    },
    {
        // Enable virtual fields when converting to JSON or Object
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// --------------------------------------
// MODEL CREATION
// --------------------------------------

reviewSchema.pre(/^find/, function (next) {
    this.populate({ path: 'user' });
    next();
});



const Review = mongoose.model('Review', reviewSchema);
// --------------------------------------
// EXPORT
// --------------------------------------
module.exports = Review;
