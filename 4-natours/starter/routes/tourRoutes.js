const express = require('express');
const { getMonthlyPlan, getAllTours, createTour, getTour, updateTour, deleteTour, getTourStats, alaisTopTours } = require('../controllers/toursController')
const { protect, restrictTo } = require('./../controllers/authController')
const fs = require('fs');
const path = require('path');
const tourRouter = express.Router();
const reviewRouter = require('./reviewRoutes');

// LEARN : this is new middle ware for interfering the value of param
// tourRouter.param('id', checkId)

const dataPath = path.join(__dirname, '../dev-data/data/tours-simple.json');
let toursData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
tourRouter.route('/top-5-cheap').get(alaisTopTours, getAllTours);
tourRouter.route('/tour-stats').get(getTourStats);
tourRouter.route('/').get(protect, getAllTours).post(createTour);
tourRouter.route('/tour-monthlyPlan/:year').get(getMonthlyPlan);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(protect, restrictTo('admin', "lead-guide"), deleteTour);

// Nested Routes for reviews
tourRouter.use('/:tourId/reviews', reviewRouter);



// REFENCE FOR THE REVIEW SUB ROUTES
// POST /tours/:tourId/reviews
// GET /tours/:tourId/reviews
// GET /tours/:tourId/reviews/:reviewId


module.exports = tourRouter;