// Import utility to wrap async functions and forward errors
const catchAsync = require('./../utils/catchAsync');

// Import custom AppError for operational errors
const AppError = require('./../utils/appError');

// importing the APIFeatures class for query handling (if needed)
// Utility for filtering, sorting, limiting fields, pagination
const APIFeatures = require('../utils/apiFeatures');

// --------------------------------------------------------------
// Factory Function: deleteOne
// Creates a reusable delete controller for ANY Mongoose model
// --------------------------------------------------------------
const deleteOne = Model =>
    catchAsync(async (req, res, next) => {

        // Delete document using ID from request params
        const doc = await Model.findByIdAndDelete(req.params.id);

        // If no document found, return 404 error
        if (!doc) {
            return next(new AppError('No tour found with that ID', 404));
        }

        // Success → 204 (No Content)
        res.status(204).json({
            status: 'success',
            data: doc          // Typically null in 204
        });
    });


// --------------------------------------------------------------
// Factory Function: updateOne
// Reusable update controller for ANY Mongoose model
// --------------------------------------------------------------
const updateOne = Model =>
    catchAsync(async (req, res, next) => {

        // Update doc with data from req.body
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,           // Return updated document
            runValidators: true  // Run schema validators
        });

        // If no document found, return 404
        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        // Success response
        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });


// --------------------------------------------------------------
// Factory Function: createOne
// Reusable create controller for ANY Mongoose model
// --------------------------------------------------------------
const createOne = Model =>
    catchAsync(async (req, res, next) => {

        // Create new document from request body
        const doc = await Model.create(req.body);

        // Send creation response
        res.status(201).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });


// --------------------------------------------------------------
// Factory Function: findOne
// Reusable get-one controller for ANY Mongoose model
// --------------------------------------------------------------
const findOne = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (Array.isArray(populateOptions)) {
            populateOptions.forEach(option => {
                query = query.populate(option);
            })
        } else {
            query = query.populate(populateOptions);
        }

        // Find document by ID
        const doc = await query;

        // If not found, send 404
        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        // Send document in response
        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });


const findAll = Model => catchAsync(async (req, res, next) => {

    // Apply query transformations using APIFeatures class
    const features = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    // Execute the constructed query
    const doc = await features.query;

    // Send response
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
});

// --------------------------------------------------------------
// EXPORT FACTORY FUNCTIONS
// --------------------------------------------------------------
module.exports = { deleteOne, updateOne, createOne, findOne, findAll };
