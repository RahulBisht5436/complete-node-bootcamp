const path = require('path');
const mongoose = require('mongoose');
const Tour = require('../Models/tours');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne } = require('./handlerFactory');

// let toursData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// LEARN : how to get data from real database to get all tours
const getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
    const allTours = await features.query;
    // NOTE : SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: allTours.length,
        data: {
            tours: allTours
        }
    });
});

const alaisTopTours = catchAsync((req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
});

const createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: newTour
    });
});

const getTour = catchAsync(async (req, res, next) => {
    const id = req.params.id;

    // Check if ID is valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('Invalid ID format', 400));
    }

    const queryData = await Tour.findById(id).populate('reviews');

    if (!queryData) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { tour: queryData }
    });
});

const updateTour = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const newUpdatedourData = await Tour.findByIdAndUpdate(id, req.body, { new: true, runValidators: true, strict: false });
    if (!newUpdatedourData) {
        return next(new AppError('No tour found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            Tour: newUpdatedourData
        }
    });
});


const deleteTour = deleteOne(Tour);


const getTourStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate(
        [
            {
                $match: { ratingAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numsRatings: { $sum: '$ratingQuantity' },
                    avgRating: { $avg: '$ratingAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                }
            },
            {
                $sort: { avgPrice: -1 }
            }
        ]
    )
    res.status(200).json({
        status: 'success',
        data: stats
    });


});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    console.log(year);
    const monthlyPlanData = await Tour.aggregate([
        {
            $unwind: '$startDates'
        }, {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        }, {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        }, {
            $addFields: { month: '$_id' }
        }, {
            $project: { _id: 0 }
        }, { $sort: { month: 1 } },
        { $limit: 12 }
    ])
    res.status(200).json({
        status: 'success',
        data: monthlyPlanData
    });

})
module.exports = { getMonthlyPlan, getAllTours, createTour, getTour, updateTour, deleteTour, alaisTopTours, getTourStats };