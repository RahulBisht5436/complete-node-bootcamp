const path = require('path');
const Tour = require('../Models/tours');
const { json } = require('express');
const APIFeatures = require('../utils/apiFeatures');

const dataPath = path.join(__dirname, '../dev-data/data/tours-simple.json');


// let toursData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// LEARN : how to get data from real database to get all tours
const getAllTours = async (req, res) => {
    try {

        // NOTE : BUILD QUERY




        // NOTE : PAGINATION


        //alasing : to provide a shortcut for frequently used query


        // console.log(JSON.parse(appendedObject));    

        // NOTE : EXECUTE QUERY
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
    } catch (error) {
        res.status(404).json({
            status: 'failed to get data',
            message: error
        })
    }

};




const alaisTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

// LEARN : how to use real database to create new tour
const createTour = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Request body is empty',
            });
        }

        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: newTour
        });

    } catch (error) {
        res.status(400).json({
            status: 'fail',
            error: "entered wrong data",
            message: error
        })
    }

};

const getTour = async (req, res) => {
    try {
        const id = req.params.id;
        const queryData = await Tour.findById(id);
        res.status(200).json({
            status: 'success',
            data: { tour: queryData }

        });
    } catch (error) {
        res.status(404).json({
            status: 'failed to get data',
            message: error
        })
    }

};

const updateTour = async (req, res) => {
    try {
        const id = req.params.id;
        const newUpdatedourData = await Tour.findByIdAndUpdate(id, req.body, { new: true, runValidators: true, strict: false });
        res.status(200).json({
            status: 'success',
            data: {
                Tour: newUpdatedourDatas
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'failed to update data',
            message: error
        })
    }
};

const deleteTour = async (req, res) => {
    try {
        const id = req.params.id;
        const tourDeletedData = Tour.findByIdAndDelete(id);
        res.status(204).json({
            status: 'success',
            message: 'data deleted successfully',
            data: null
        });
    } catch (error) {
        res.status(404).json({
            status: 'failed to delete data',
            message: error
        })
    }

};



module.exports = { getAllTours, createTour, getTour, updateTour, deleteTour, alaisTopTours };