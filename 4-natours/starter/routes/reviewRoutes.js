const express = require('express');
const { getAllReviews, createReview, getTourAllReviews } = require('../controllers/reviewController');

// mergeParams to access params from parent router
const reviewRouter = express.Router({ mergeParams: true });

const { protect, restrictTo } = require('../controllers/authController');

reviewRouter.route('/getTourAllReviews',).get(getTourAllReviews);
reviewRouter.route('/').get(getAllReviews).post(protect, restrictTo('user'), createReview);


module.exports = reviewRouter;
