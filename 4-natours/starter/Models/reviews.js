// --------------------------------------
// IMPORTS
// --------------------------------------
const mongoose = require('mongoose');


// --------------------------------------
// REVIEW SCHEMA
// --------------------------------------
// Schema that defines how reviews are stored in MongoDB.
// Each review is connected to:
//   - a Tour (tour field)
//   - a User (user field)
// Also includes validation rules for text and rating.
// --------------------------------------
const reviewSchema = new mongoose.Schema(
    {
        // Review text content
        review: {
            type: String,
            required: [true, "Review cannot be empty"],
            trim: true
        },

        // Rating provided by user (1–5)
        rating: {
            type: Number,
            min: 1,
            max: 5
        },

        // Automatically set date of creation
        createdAt: {
            type: Date,
            default: Date.now
        },

        // Reference to the Tour that this review belongs to
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, "Review must belong to a tour"]
        },

        // Reference to the User who wrote the review
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, "Review must belong to a user"]
        }
    },
    {
        // Include virtuals whenever converting review to JSON or object
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


// --------------------------------------
// POPULATION MIDDLEWARE
// --------------------------------------
// Automatically populate the "user" field whenever a find query runs.
// Ensures API responses show user details without manually calling populate()
// --------------------------------------
reviewSchema.pre(/^find/, function (next) {
    this.populate({ path: 'user' });  // Populate only user info
    next();
});


// --------------------------------------
// MODEL CREATION
// --------------------------------------
const Review = mongoose.model('Review', reviewSchema);


// --------------------------------------
// EXPORT MODEL
// --------------------------------------
module.exports = Review;
