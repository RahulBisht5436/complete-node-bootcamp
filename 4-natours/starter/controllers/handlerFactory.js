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

// Creates a reusable update controller for ANY Mongoose model
const updateOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }); 
        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    }
);

const createOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);   
        res.status(201).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });

// Export the factory so it can be used in any route/controller
module.exports = { deleteOne  , updateOne , createOne };
