const express = require('express');
const { getAllReviews, createReview } = require('../controllers/reviewController');
const reviewRouter = express.Router();
const { protect, restrictTo } = require('../controllers/authController');

reviewRouter.route('/').get(getAllReviews).post(protect, restrictTo('user'), createReview);



module.exports = reviewRouter;
