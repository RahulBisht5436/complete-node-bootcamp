// Express router
const express = require('express');

// Import review controller functions
const {
    getAllReviews,
    createReview,
    getTourAllReviews,
    deleteReview,
    createReviewPreHandler,
    updateReview,
    getReview
} = require('../controllers/reviewController');

// Import authentication & authorization middleware
const { protect, restrictTo } = require('../controllers/authController');

// ------------------------------------------------------------
// Create Router
// mergeParams: true → allows access to params from parent router
// Example: /tours/:tourId/reviews
// ------------------------------------------------------------
const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(protect); // All routes after this require authentication

// ------------------------------------------------------------
// ROUTE: GET /  → Get all reviews
// ROUTE: POST / → Create review (Only authenticated 'user' role)
// ------------------------------------------------------------
reviewRouter
    .route('/')
    .get(getAllReviews)                       // Fetch all reviews
    .post(                              // User must be logged in
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
    .get(getReview)                           // Get a single review by ID
    .patch(
        restrictTo('user', 'admin'),          // Only user or admin roles may
        updateReview
    )                          // Must be authenticated
    .delete(
        restrictTo('user', 'admin'),          // Only user or admin roles may delete reviews
        deleteReview
    );



// Export the router for use in app.js
module.exports = reviewRouter;
