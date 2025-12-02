// --------------------------------------
// IMPORTS
// --------------------------------------
const mongoose = require('mongoose');
const Tour = require('./tours.js');


// --------------------------------------
// REVIEW SCHEMA
// --------------------------------------
// Defines the structure of each Review document.
// A review must:
//   - Contain text ("review")
//   - Have a rating (1–5)
//   - Belong to a Tour
//   - Belong to a User
// --------------------------------------
const reviewSchema = new mongoose.Schema(
    {
        // Review text content
        review: {
            type: String,
            required: [true, "Review cannot be empty"],
            trim: true
        },

        // Rating provided by the user (range 1–5)
        rating: {
            type: Number,
            min: 1,
            max: 5
        },

        // Timestamp auto-set on review creation
        createdAt: {
            type: Date,
            default: Date.now
        },

        // Tour that this review belongs to (reference to Tour collection)
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, "Review must belong to a tour"]
        },

        // User who wrote the review (reference to User collection)
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, "Review must belong to a user"]
        }
    },
    {
        // Include virtual properties when converting to JSON or Object
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


// --------------------------------------
// STATIC METHOD: CALCULATE AVG RATINGS
// --------------------------------------
// This aggregates all reviews for a tour and computes:
//   - number of ratings
//   - average rating
// Called using Review.calcAverageRatings(tourId)
// --------------------------------------
reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        // Match reviews that belong to the given tour
        {
            $match: { tour: tourId }
        },
        // Group them to calculate total count + average rating
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRAting: { $avg: '$rating' }
            }
        }
    ]);
    return stats;
}


// --------------------------------------
// POST-SAVE MIDDLEWARE
// --------------------------------------
// Runs after .save()
// Purpose:
//   - Update the tour's ratingAverage and ratingQuantity
// whenever a new review is created.
// --------------------------------------
reviewSchema.post('save', async function () {
    // 'this' is the newly created review document
    const stats = await this.constructor.calcAverageRatings(this.tour);

    // Update Tour with the new aggregated stats
    const UpdatedTour = await Tour.findByIdAndUpdate(
        this.tour,
        {
            ratingQuantity: stats[0].nRating,
            ratingAverage: stats[0].avgRAting
        },
        { new: true }
    );

    if (!UpdatedTour) {
        console.log("Tour not found while updating ratings");
    }
});


// --------------------------------------
// PRE FINDONEAND MIDDLEWARE
// --------------------------------------
// Runs before findOneAndUpdate / findOneAndDelete.
// Since findOneAnd* does NOT give access to the updated/deleted doc,
// we manually query the document beforehand and store it in 'this.r'
// --------------------------------------
reviewSchema.pre(/^findOneAnd/, async function (next) {
    // Query the document before update/delete
    this.r = await this.model.findOne(this.getQuery());
    next();
});


// --------------------------------------
// POST FINDONEAND MIDDLEWARE
// --------------------------------------
// Runs after findOneAndUpdate / findOneAndDelete.
// Uses the pre-stored document ('this.r') to recalculate tour ratings.
// Needed because findOneAnd* does NOT trigger .save() middleware.
// --------------------------------------
reviewSchema.post(/^findOneAnd/, async function () {
    // this.r = document before the update/delete
    if (this.r) {
        const stats = await this.r.constructor.calcAverageRatings(this.r.tour);

        // Update tour stats safely (fallback for when no reviews exist)
        const UpdatedTour = await Tour.findByIdAndUpdate(
            this.r.tour,
            {
                ratingQuantity: stats[0]?.nRating || 0,
                ratingAverage: stats[0]?.avgRAting || 4.5
            },
            { new: true }
        );
    }
});


// --------------------------------------
// POPULATION MIDDLEWARE
// --------------------------------------
// Automatically populate the 'user' field on any find query.
// Makes sure API responses include user info without extra .populate()
// --------------------------------------
reviewSchema.pre(/^find/, function (next) {
    this.populate({ path: 'user' });  // Populate only user details
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
