// Utility wrapper to handle async errors
const catchAsync = require('../utils/catchAsync');

// Review model
const Review = require('../Models/reviews');

// Custom error class for operational errors
const AppError = require('../utils/appError');

// Reusable delete factory function
const { deleteOne, updateOne, createOne } = require('./handlerFactory');



// ------------------------------------------------------------
// Get ALL Reviews (Admin or open route)
// ------------------------------------------------------------
const getAllReviews = catchAsync(async (req, res, next) => {

    // Fetch all reviews from the database
    const reviews = await Review.find();

    // If no reviews exist (usually returns empty array, not null)
    if (!reviews) {
        return next(new AppError('No reviews found', 404));
    }

    // Successful response
    res.status(200).json({
        status: 'success',
        message: 'Reviews fetched successfully',
        data: {
            reviews
        }
    });
});



// ------------------------------------------------------------
// Get ALL reviews for a specific tour
// Route: GET /api/v1/tours/:tourId/reviews
// ------------------------------------------------------------
const getTourAllReviews = catchAsync(async (req, res, next) => {

    // Extract tour ID from URL params
    console.log(req.params.tourId);

    // Find reviews linked to this tour
    const reviews = await Review.find({ tour: req.params.tourId });

    // If none found
    if (!reviews) {
        return next(new AppError('No reviews found for this tour', 404));
    }

    console.log(reviews.length);

    // Successful response
    return res.status(200).json({
        status: 'success',
        message: 'Tour reviews fetched successfully',
        reviews
    });
});


const updateReview = updateOne(Review);



// ------------------------------------------------------------
// Create a new review
// Auto-assigns user & tour from protect() and nested routes
// ------------------------------------------------------------



// code for the create review pre-handler middleware
const createReviewPreHandler = catchAsync(async (req, res, next) => {
    // Auto-fill tourID from URL if not provided in body
    if (!req.body.tourID) req.body.tour = req.params.tourId;
    // Auto-fill user ID from protect middleware
    if (!req.body.user) req.body.user = req.user.id;

    console.log(req.body)
    next();

});


// Create Review controller using factory function
const createReview = createOne(Review);




// ------------------------------------------------------------
// Delete Review (Uses factory deleteOne)
// Hard delete → removes from DB
// ------------------------------------------------------------
const deleteReview = deleteOne(Review);



// Export controllers
module.exports = {
    getAllReviews,
    createReview,
    createReviewPreHandler,
    getTourAllReviews,
    deleteReview,
    updateReview
};
