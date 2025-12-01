const express = require('express');
const { getAllReviews, createReview } = require('../controllers/reviewController');

// mergeParams to access params from parent router
const reviewRouter = express.Router({ mergeParams: true });

const { protect, restrictTo } = require('../controllers/authController');

reviewRouter.route('/').get(getAllReviews).post(protect, restrictTo('user'), createReview);



module.exports = reviewRouter;
