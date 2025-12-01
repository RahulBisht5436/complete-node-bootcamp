const express = require('express');
const { getAllReviews, createReview, getTourAllReviews , deleteReview } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');
// mergeParams to access params from parent router
const reviewRouter = express.Router({ mergeParams: true });


reviewRouter.route('/').get(getAllReviews).post(protect, restrictTo('user'), createReview);
reviewRouter.route('/getTourAllReviews').get(getTourAllReviews);
reviewRouter.route('/:id').delete(protect , restrictTo('user', 'admin'), deleteReview);


module.exports = reviewRouter;
