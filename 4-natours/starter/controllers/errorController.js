// Import custom AppError class to create operational errors
const AppError = require('../utils/appError');


// -----------------------------------------------------------
// Handle Mongoose Cast Errors (invalid ObjectId, etc.)
// Example: /api/tours/invalid-id → CastError
// -----------------------------------------------------------
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};


// -----------------------------------------------------------
// Handle JWT Errors (invalid signature)
// -----------------------------------------------------------
const JsonWebTokenError = err => new AppError(err, 401);


// -----------------------------------------------------------
// Handle Mongoose Validation Errors
// E.g. required fields missing, min/max, etc.
// -----------------------------------------------------------
const handleValidationErrorDB = err => {
    // Extract all validation error messages
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};


// -----------------------------------------------------------
// Handle Duplicate Field Errors (Mongo error code 11000)
// Occurs when unique field already exists
// -----------------------------------------------------------
const handleDuplicateFieldsDB = err => {

    // Handle duplicate key field (Mongoose newer versions provide keyValue)
    let value = '';

    if (err.keyValue) {
        // Grab the duplicated field and its value
        value = JSON.stringify(err.keyValue);

    } else if (err.errmsg) {
        // Fallback for older versions: extract between quotes
        const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
        value = match ? match[0] : '';
    }

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};


// -----------------------------------------------------------
// Send detailed error in development environment
// Includes full stack + error object for debugging
// -----------------------------------------------------------
const sendErrorDev = (err, req, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};


// -----------------------------------------------------------
// Send minimal, safe error in production
// Only operational errors are shown to the client
// Unknown/unexpected errors → generic "something went wrong"
// -----------------------------------------------------------
const sendErrorProd = (err, req, res) => {

    // Trusted & operational error → show user the message
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });

    } else {
        // Log programming or unknown errors for developers
        console.error('ERROR 💥', err);

        // Generic error message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};



// -----------------------------------------------------------
// MAIN GLOBAL ERROR HANDLER MIDDLEWARE
// This function runs for every thrown/caught error in app
// -----------------------------------------------------------
module.exports = (err, req, res, next) => {

    // Ensure error has status and statusCode
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // ------------------------------------------
    // DEVELOPMENT ERROR RESPONSE
    // ------------------------------------------
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
        return;
    }


    // ------------------------------------------
    // PRODUCTION ERROR RESPONSE
    // ------------------------------------------
    let error = Object.assign({}, err);

    // Ensure important properties are carried over
    error.message = err.message;
    error.name = err.name;

    // Handle invalid MongoDB IDs
    if (error.name === 'CastError') {
        error = handleCastErrorDB(error);
    }

    // Handle duplicate fields (unique constraint)
    if (error.code === 11000) {
        error = handleDuplicateFieldsDB(error);
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
        error = handleValidationErrorDB(error);
    }

    // Handle invalid JWT
    if (error.name === "JsonWebTokenError") {
        handleJWTError(error);
    }

    // Send safe error response
    sendErrorProd(error, req, res);
};
