// ------------------------------------------------------------
// catchAsync Utility
// Wraps async route handlers to automatically catch errors
// and forward them to Express's global error handler using next()
//
// This eliminates repetitive try/catch blocks in controllers.
// ------------------------------------------------------------
const catchAsync = fn => {
    return (req, res, next) => {

        // Execute the async function (fn)
        // If it rejects (throws an error), .catch() forwards the error to next()
        fn(req, res, next).catch(err => next(err));
    };
};

module.exports = catchAsync;
