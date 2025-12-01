// Utility wrapper to handle async errors
const catchAsync = require('../utils/catchAsync');

// Review model
const Review = require('../Models/reviews');

// Custom error class for operational errors
const AppError = require('../utils/appError');

// Reusable delete factory function
const { deleteOne } = require('./handlerFactory');



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



// ------------------------------------------------------------
// Create a new review
// Auto-assigns user & tour from protect() and nested routes
// ------------------------------------------------------------
const createReview = catchAsync(async (req, res, next) => {

    // Auto-fill tourID from URL if not provided in body
    if (!req.body.tourID) req.body.tourID = req.params.tourId;

    // Auto-fill user ID from protect middleware
    if (!req.body.user) req.body.user = req.user.id;

    const userID = req.body.user;
    const tourID = req.body.tourID;

    // Extract required fields
    const { review, rating } = req.body;

    // Validate all required fields exist
    if (!review || !rating || !tourID || !userID) {
        return next(new AppError('Please provide review, rating, tour, and user', 400));
    }

    // Create review document in DB
    const newReview = await Review.create({
        review,
        rating,
        tour: tourID,
        user: userID
    });

    // Send success response
    return res.status(201).json({
        status: 'success',
        message: 'Review created successfully',
        data: {
            review: newReview
        }
    });
});



// ------------------------------------------------------------
// Delete Review (Uses factory deleteOne)
// Hard delete → removes from DB
// ------------------------------------------------------------
const deleteReview = deleteOne(Review);



// Export controllers
module.exports = { 
    getAllReviews, 
    createReview, 
    getTourAllReviews, 
    deleteReview 
};
