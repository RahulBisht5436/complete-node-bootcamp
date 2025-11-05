const path = require('path');
const Tour = require('../Models/tours');
const { json } = require('express');
const APIFeatures = require('../utils/apiFeatures');
const { start } = require('repl');
const catchAsync = require('../utils/catchAsync');
const dataPath = path.join(__dirname, '../dev-data/data/tours-simple.json');

// let toursData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// LEARN : how to get data from real database to get all tours
const getAllTours = catchAsync(async (req, res) => {
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

// LEARN : how to use real database to create new tour

// Error Handling


const createTour = catchAsync(async (req, res) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: newTour
    });
});

const getTour = catchAsync(async (req, res) => {

    const id = req.params.id;
    const queryData = await Tour.findById(id);
    res.status(200).json({
        status: 'success',
        data: { tour: queryData }

    });

});

const updateTour = catchAsync(async (req, res) => {
    const id = req.params.id;
    const newUpdatedourData = await Tour.findByIdAndUpdate(id, req.body, { new: true, runValidators: true, strict: false });
    res.status(200).json({
        status: 'success',
        data: {
            Tour: newUpdatedourData
        }
    });
});

const deleteTour = catchAsync(async (req, res) => {
    const id = req.params.id;
    const tourDeletedData = Tour.findByIdAndDelete(id);
    res.status(204).json({
        status: 'success',
        message: 'data deleted successfully',
        data: null
    });
});

const getTourStats = catchAsync(async (req, res) => {

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
    console.log(stats);
    res.status(200).json({
        status: 'success',
        data: stats
    });


});

const getMonthlyPlan = catchAsync(async (req, res) => {
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