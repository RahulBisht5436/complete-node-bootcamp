const Tour = require('../Models/tours')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')


const createCheckoutSession = catchAsync(async (req, res, next) => {
    const tourId = req.params.tourId;
    if (!tourId) return next(new AppError('Please provide a valid tour id', 400));

    const tour = await Tour.findById(tourId);
    if (!tour || !tour.slug) {
        return next(new AppError('Tour not found or slug missing', 400));
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get("host")}/?alert=booking`,
        cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary
                    },
                    unit_amount: tour.price * 100
                },
                quantity: 1
            }
        ]
    });

    res.status(200).json({ status: 'success', session });
});



module.exports = { createCheckoutSession }