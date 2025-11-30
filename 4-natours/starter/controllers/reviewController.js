const catchAsync = require('../utils/catchAsync');
const Review = require('../Models/reviews');
const AppError = require('../utils/appError');
const getAllReviews = catchAsync( async (req, res, next) => {
    const reviews = await Review.find();
    if(!reviews){
        return next( new AppError('No reviews found',404));
    }
    res.status(200).json({
        status: 'success',
        message: 'Reviews fetched successfully',
        data:{
            reviews
        }
    });
});
const createReview = catchAsync(async (req, res, next) => {
    const { review, rating, tour, user } = req.body;
    if (!review || !rating || !tour || !user) {
        return next(new AppError('Please provide review, rating, tour, and user', 400));
    }
    const newReview = await Review.create({
        review,
        rating,
        tour,
        user
    });

    return res.status(201).json({
        status: 'success',
        message: 'Review created successfully',
        data: {
            review: newReview
        }
    });
});

module.exports= { getAllReviews ,createReview }