// Express router
const express = require('express');

// Import review controller functions
const { 
    getAllReviews, 
    createReview, 
    getTourAllReviews, 
    deleteReview,
    createReviewPreHandler,
    updateReview 
} = require('../controllers/reviewController');

// Import authentication & authorization middleware
const { protect, restrictTo } = require('../controllers/authController');

// ------------------------------------------------------------
// Create Router
// mergeParams: true → allows access to params from parent router
// Example: /tours/:tourId/reviews
// ------------------------------------------------------------
const reviewRouter = express.Router({ mergeParams: true });



// ------------------------------------------------------------
// ROUTE: GET /  → Get all reviews
// ROUTE: POST / → Create review (Only authenticated 'user' role)
// ------------------------------------------------------------
reviewRouter
    .route('/')
    .get(getAllReviews)                       // Fetch all reviews
    .post(
        protect,                              // User must be logged in
        restrictTo('user'),
        createReviewPreHandler,               // Pre-handler to auto-fill tour and user IDs
        createReview
    );



// ------------------------------------------------------------
// ROUTE: GET /getTourAllReviews
// Fetch all reviews for a specific tour (tourId from parent route)
// ------------------------------------------------------------
reviewRouter
    .route('/getTourAllReviews')
    .get(getTourAllReviews);



// ------------------------------------------------------------
// ROUTE: DELETE /:id
// Delete a review → Only logged-in user/admin allowed
// Uses factory deleteOne
// ------------------------------------------------------------
reviewRouter
    .route('/:id')
    .patch(
        protect,
        restrictTo('user'),
        updateReview
    )                          // Must be authenticated
    .delete(
        protect,                              // Must be authenticated
        restrictTo('user', 'admin'),          // Only user or admin roles may delete reviews
        deleteReview
    );



// Export the router for use in app.js
module.exports = reviewRouter;
