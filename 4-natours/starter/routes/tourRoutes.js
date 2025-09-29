const express = require('express');
const {getAllTours ,createTour, getTour, updateTour,deleteTour} = require('../controllers/toursController')
const fs = require('fs');
const path = require('path');
const tourRouter = express.Router();

const dataPath = path.join(__dirname, '../dev-data/data/tours-simple.json');
let toursData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = tourRouter;