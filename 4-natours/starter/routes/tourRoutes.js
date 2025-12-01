// Import express
const express = require('express');

// Import controller functions for tours
const { 
    getMonthlyPlan, 
    getAllTours, 
    createTour, 
    getTour, 
    updateTour, 
    deleteTour, 
    getTourStats, 
    alaisTopTours 
} = require('../controllers/toursController');

// Import authentication & authorization middleware
const { protect, restrictTo } = require('./../controllers/authController');

// File system & path utilities (used to load dummy data)
const fs = require('fs');
const path = require('path');

// Create express router
const tourRouter = express.Router();

// Import nested review router
const reviewRouter = require('./reviewRoutes');


// ------------------------------------------------------------
// PARAM MIDDLEWARE (commented out reference)
// Example: Validate ID before route handler runs
// ------------------------------------------------------------
// tourRouter.param('id', checkId);


// ------------------------------------------------------------
// Read sample tour data file (not used in real DB mode)
// ------------------------------------------------------------
const dataPath = path.join(__dirname, '../dev-data/data/tours-simple.json');
let toursData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));


// ------------------------------------------------------------
// TOP 5 CHEAP TOURS (alias middleware + main controller)
// ------------------------------------------------------------
tourRouter
    .route('/top-5-cheap')
    .get(alaisTopTours, getAllTours);


// ------------------------------------------------------------
// TOUR STATISTICS (Aggregation pipeline)
// ------------------------------------------------------------
tourRouter
    .route('/tour-stats')
    .get(getTourStats);


// ------------------------------------------------------------
// MAIN ROUTE: /
// GET all tours (protected)
// POST new tour (public in this setup)
// ------------------------------------------------------------
tourRouter
    .route('/')
    .get(protect, getAllTours)     // Only logged-in users can view tours
    .post(createTour);             // Anyone can create a tour (can restrict later)


// ------------------------------------------------------------
// MONTHLY PLAN ROUTE
// Example: /tour-monthlyPlan/2025
// ------------------------------------------------------------
tourRouter
    .route('/tour-monthlyPlan/:year')
    .get(getMonthlyPlan);


// ------------------------------------------------------------
// SINGLE TOUR ROUTES: /:id
// GET -> Fetch specific tour
// PATCH -> Update tour
// DELETE -> Delete tour (admins only)
// ------------------------------------------------------------
tourRouter
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(
        protect,                           // User must be logged in
        restrictTo('admin', "lead-guide"), // Only admin or lead-guide can delete tours
        deleteTour
    );


// ------------------------------------------------------------
// NESTED ROUTES FOR REVIEWS
//
// This means:
// /tours/:tourId/reviews  → forwarded to reviewRouter
//
// reviewRouter has mergeParams: true to access :tourId
// ------------------------------------------------------------
tourRouter.use('/:tourId/reviews', reviewRouter);


// ------------------------------------------------------------
// ROUTE REFERENCES
// POST   /tours/:tourId/reviews
// GET    /tours/:tourId/reviews
// GET    /tours/:tourId/reviews/:reviewId
// ------------------------------------------------------------


// Export router for use in app.js
module.exports = tourRouter;
