const catchAsync = require('../utils/catchAsync');
const Review = require('../Models/reviews');
const AppError = require('../utils/appError');


const getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find();
    if (!reviews) {
        return next(new AppError('No reviews found', 404));
    }
    res.status(200).json({
        status: 'success',
        message: 'Reviews fetched successfully',
        data: {
            reviews
        }
    });
});




const createReview = catchAsync(async (req, res, next) => {
    if (!req.body.tourID) req.body.tourID = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    const userID = req.body.user; // Assuming protect middleware adds user to req
    const tourID = req.body.tourID;
    const { review, rating } = req.body;
    if (!review || !rating || !tourID || !userID) {
        return next(new AppError('Please provide review, rating, tour, and user', 400));
    }
    const newReview = await Review.create({
        review,
        rating,
        tour: tourID,
        user: userID
    });

    return res.status(201).json({
        status: 'success',
        message: 'Review created successfully',
        data: {
            review: newReview
        }
    });
});

module.exports = { getAllReviews, createReview }