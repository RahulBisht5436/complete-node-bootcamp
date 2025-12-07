// Path module (not used here but kept as imported)
const path = require('path');

// Mongoose for ObjectId checks and DB operations
const mongoose = require('mongoose');

// Tour model
const Tour = require('../Models/tours');

// Custom AppError class
const AppError = require('../utils/appError');

// Async error wrapper
const catchAsync = require('../utils/catchAsync');

// Factory delete and update handler (hard delete and update)
const { deleteOne, updateOne, createOne, findOne, findAll } = require('./handlerFactory');



// ------------------------------------------------------------
// GET ALL TOURS
// Supports filtering, sorting, limiting fields, and pagination
// ------------------------------------------------------------
const getAllTours = findAll(Tour);

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
const getTour = findOne(Tour, { path: 'reviews' });

// ------------------------------------------------------------
// UPDATE TOUR (by ID)
// ------------------------------------------------------------
const updateTour = updateOne(Tour);


// ------------------------------------------------------------
// DELETE TOUR (hard delete)
// Uses factory deleteOne
// ------------------------------------------------------------
const deleteTour = deleteOne(Tour);

// /tours-within/:distance/center/:latlng/unit/:unit
const getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, lnglat, unit } = req.params;

    if (!lnglat || !distance || !unit) {
        return next(new AppError('Please provide distance, center (lnglat), and unit parameters.', 400));
    }

    const [lng, lat] = lnglat.split(',');

    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }


    // Find all tours whose startLocation is within a certain distance
    // from the given longitude (lng) and latitude (lat)
    const tours = await Tour.find({

        // We are filtering based on the startLocation field in our documents
        startLocation: {

            // $geoWithin → Find documents inside a given geometric shape
            $geoWithin: {

                // $centerSphere → Defines a circular area on Earth's sphere
                $centerSphere: [

                    // 1️⃣ Center of the circle (longitude, latitude)
                    // lng * 1 and lat * 1 convert strings to numbers if necessary
                    [lng * 1, lat * 1],

                    // 2️⃣ Radius of the circle IN RADIANS
                    // MongoDB expects radius in radians, not miles/kilometers
                    // Formula: distance / Earth's radius
                    // If user wants miles → use 3963.2 (Earth radius in miles)
                    // If user wants kilometers → use 6378.1 (Earth radius in km)
                    distance / (unit === 'mi' ? 3963.2 : 6378.1)
                ]
            }
        }
    });



    res.status(200).json({
        status: 'success',
        message: 'getToursWithin endpoint works',
        results: tours
    });
})
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

const getToursDistance = catchAsync(async (req, res, next) => {
    const { lnglat, unit } = req.params;
    const [lng, lat] = lnglat.split(',');
    if (!lat || !lng || !unit) {
        return next(new AppError('Please provide latitude, longitude and unit in the format lat,lng and unit.', 400));
    }

    const data = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: unit === 'mi' ? 0.000621371 : 0.001
            }
        },{
            $project: {
                distance: 1,
                name: 1
            }
        },
        {
            $sort: { distance: -1}
        }
    ])

    return res.status(200).json({
        status: 'success',
        message: 'getToursDistance endpoint works',
        data: data
    });
})

// ------------------------------------------------------------
// GET MONTHLY PLAN
// Shows number of tour starts each month for a given year
// ------------------------------------------------------------
const getMonthlyPlan = catchAsync(async (req, res, next) => {

    const year = req.params.year * 1; // Convert to number

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
    getToursWithin,
    getToursDistance,
    getTourStats
};
