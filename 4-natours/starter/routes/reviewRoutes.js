const express = require('express');
const { getAllReviews, createReview } = require('../controllers/reviewController');
const reviewRouter = express.Router();

reviewRouter.route('/').get(getAllReviews).post(createReview);



module.exports = reviewRouter;
