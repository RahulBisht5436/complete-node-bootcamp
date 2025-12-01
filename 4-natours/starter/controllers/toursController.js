// Path module (not used here but kept as imported)
const path = require('path');

// Mongoose for ObjectId checks and DB operations
const mongoose = require('mongoose');

// Tour model
const Tour = require('../Models/tours');

// Utility for filtering, sorting, limiting fields, pagination
const APIFeatures = require('../utils/apiFeatures');

// Custom AppError class
const AppError = require('../utils/appError');

// Async error wrapper
const catchAsync = require('../utils/catchAsync');

// Factory delete and update handler (hard delete and update)
const { deleteOne , updateOne , createOne } = require('./handlerFactory');



// ------------------------------------------------------------
// GET ALL TOURS
// Supports filtering, sorting, limiting fields, and pagination
// ------------------------------------------------------------
const getAllTours = catchAsync(async (req, res, next) => {

    // Apply query transformations using APIFeatures class
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    // Execute the constructed query
    const allTours = await features.query;

    // Send response
    res.status(200).json({
        status: 'success',
        results: allTours.length,
        data: {
            tours: allTours
        }
    });
});



// ------------------------------------------------------------
// ALIAS MIDDLEWARE
// Pre-fills query params for "Top 5 cheapest"
//
// This runs BEFORE getAllTours
// ------------------------------------------------------------
const alaisTopTours = catchAsync((req, res, next) => {

    // Pre-set query parameters
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

    next();
});



// ------------------------------------------------------------
// CREATE A NEW TOUR
// ------------------------------------------------------------
const createTour = createOne(Tour);



// ------------------------------------------------------------
// GET A SINGLE TOUR (by ID)
//
// Includes ID validation and review population
// ------------------------------------------------------------
const getTour = catchAsync(async (req, res, next) => {

    const id = req.params.id;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('Invalid ID format', 400));
    }

    // Find tour and populate its "reviews" virtual field
    const queryData = await Tour.findById(id).populate('reviews');

    // If not found
    if (!queryData) {
        return next(new AppError('No tour found with that ID', 404));
    }

    // Successful response
    res.status(200).json({
        status: 'success',
        data: { tour: queryData }
    });
});



// ------------------------------------------------------------
// UPDATE TOUR (by ID)
// ------------------------------------------------------------
const updateTour = updateOne(Tour);


// ------------------------------------------------------------
// DELETE TOUR (hard delete)
// Uses factory deleteOne
// ------------------------------------------------------------
const deleteTour = deleteOne(Tour);



// ------------------------------------------------------------
// GET TOUR STATISTICS
//
// Uses MongoDB Aggregation to produce grouped analytics
// ------------------------------------------------------------
const getTourStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
        {
            $match: { ratingAverage: { $gte: 4.5 } }  // Only high-rated tours
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },   // Group by difficulty
                numTours: { $sum: 1 },
                numsRatings: { $sum: '$ratingQuantity' },
                avgRating: { $avg: '$ratingAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            }
        },
        {
            $sort: { avgPrice: -1 }   // Sort by price descending
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: stats
    });
});



// ------------------------------------------------------------
// GET MONTHLY PLAN
// Shows number of tour starts each month for a given year
// ------------------------------------------------------------
const getMonthlyPlan = catchAsync(async (req, res, next) => {

    const year = req.params.year * 1; // Convert to number
    console.log(year);

    const monthlyPlanData = await Tour.aggregate([
        {
            $unwind: '$startDates'    // Deconstruct startDates array
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },  // Group by month
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }   // Add month field
        },
        {
            $project: { _id: 0 }            // Remove _id
        },
        {
            $sort: { month: 1 }             // Sort ASC by month
        },
        {
            $limit: 12                      // Max 12 months
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: monthlyPlanData
    });
});



// Export all controller functions
module.exports = {
    getMonthlyPlan,
    getAllTours,
    createTour,
    getTour,
    updateTour,
    deleteTour,
    alaisTopTours,
    getTourStats
};
