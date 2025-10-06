const path = require('path');
const Tour = require('../Models/tours');
const dataPath = path.join(__dirname, '../dev-data/data/tours-simple.json');
// let toursData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const validateToursData = (req, res, next) => {
    const { name, duration, difficulty, price } = req.body;

    if (!name || !duration || !difficulty || !price) {
        return res.status(400).json({
            status: "failed",
            message: "Request body must include name, duration, difficulty, and price",
        });
    }

    if (typeof name !== "string") {
        return res.status(400).json({
            status: "failed",
            message: "Name must be a string",
        });
    }

    if (typeof difficulty !== "string") {
        return res.status(400).json({
            status: "failed",
            message: "Difficulty must be a string",
        });
    }

    if (typeof duration !== "number") {
        return res.status(400).json({
            status: "failed",
            message: "Duration must be a number",
        });
    }

    if (typeof price !== "number") {
        return res.status(400).json({
            status: "failed",
            message: "Price must be a number",
        });
    }
    next();
};

const getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
    });
};

const createTour = (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            status: 'fail',
            message: 'Request body is empty',
        });
    }
    res.status(201).json({
        status: 'success'
    });
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

module.exports = { getAllTours, createTour, getTour, updateTour, deleteTour, validateToursData }