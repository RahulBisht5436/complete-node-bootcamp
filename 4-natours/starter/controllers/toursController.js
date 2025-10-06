const path = require('path');
const Tour = require('../Models/tours');
const dataPath = path.join(__dirname, '../dev-data/data/tours-simple.json');
// let toursData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// LEARN : how to get data from real database to get all tours
const getAllTours = async (req, res) => {
    try {
        const allTours = await Tour.find();
        console.log(allTours);
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


const getTour = (req, res) => {
    
    const id = Number(req.params.id);
    const queryData = toursData.find(el => el.id === id);
    res.status(200).json({
        status: 'success',
    });
};

const updateTour = (req, res) => {
    const id = Number(req.params.id);
    const tourIndex = toursData.findIndex(el => el.id === id);
    res.status(200).json({
        status: 'success',
    });
};

const deleteTour = (req, res) => {
    const id = Number(req.params.id);
    const tourIndex = toursData.findIndex(el => el.id === id);
    res.status(204).json({
        status: 'success',
    });
};

module.exports = { getAllTours, createTour, getTour, updateTour, deleteTour }