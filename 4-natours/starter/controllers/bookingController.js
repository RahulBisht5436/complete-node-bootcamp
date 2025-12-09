const Tour = require('../Models/tours');
const Booking = require('../Models/bookingModels');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Creates a Stripe Checkout Session for the selected tour
 * This sends the user to Stripe payment page
 */
const createCheckoutSession = catchAsync(async (req, res, next) => {
    const tourId = req.params.tourId;

    // Validate Tour ID presence
    if (!tourId) {
        return next(new AppError('Please provide a valid tour id', 400));
    }

    const tour = await Tour.findById(tourId);

    // Validate tour exists and has a slug (needed for cancel redirect)
    if (!tour || !tour.slug) {
        return next(new AppError('Tour not found or slug missing', 400));
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get("host")}/?tourId=${tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: tourId,
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary
                    },
                    unit_amount: tour.price * 100 // Stripe expects price in cents
                },
                quantity: 1
            }
        ]
    });

    // Send session to client
    res.status(200).json({ status: 'success', session });
});

/**
 * Creates a booking in the database after successful payment redirect
 * Temporary approach — should be replaced with Stripe Webhook
 */
const newBooking = catchAsync(async (req, res, next) => {
    const { tourId, user, price } = req.query;

    // If required data is missing, skip this middleware
    if (!tourId || !user || !price) {
        return next();
    }

    // Create booking document in MongoDB
    const booking = await Booking.create({
        tour: tourId,
        user: user,
        price: price
    });

    if (!booking) {
        return next(new AppError("Not able to create booking", 400));
    }

    // Redirect user after successful booking creation
    res.redirect('/my-tours');

    // Allow next middlewares to continue without query processing
    return next();
});

module.exports = { createCheckoutSession, newBooking };
