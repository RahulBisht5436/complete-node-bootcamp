// Import utility to wrap async functions and forward errors
const catchAsync = require('./../utils/catchAsync');

// Import custom AppError for operational errors
const AppError = require('./../utils/appError');


// --------------------------------------------------------------
// Factory Function: deleteOne
// Creates a reusable delete controller for ANY Mongoose model
// --------------------------------------------------------------
const deleteOne = Model =>
    catchAsync(async (req, res, next) => {

        // Attempt to delete the document by ID passed in req.params.id
        const doc = await Model.findByIdAndDelete(req.params.id);

        // If document is not found → throw 404 error
        if (!doc) {
            return next(new AppError('No tour found with that ID', 404));
        }

        // If deletion successful → send 204 No Content response
        res.status(204).json({
            status: 'success',
            data: doc      // Usually null in 204, but returning for debugging
        });
    });


// Export the factory so it can be used in any route/controller
module.exports = { deleteOne };
