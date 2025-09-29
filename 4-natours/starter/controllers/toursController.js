const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../dev-data/data/tours-simple.json');
let toursData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const getAllTours = (req, res) => {
    console.log(req.requestTime);
    if (toursData && toursData.length > 0) {
        res.status(200).json({
            status: 'success',
            results: toursData.length,
            data: { tours: toursData },
        });
    } else {
        res.status(500).json({
            status: 'fail',
            message: 'Internal server error, no data found',
        });
    }
};

const createTour = (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            status: 'fail',
            message: 'Request body is empty',
        });
    }
    const newId = toursData.length > 0 ? toursData[toursData.length - 1].id + 1 : 1;
    const newTour = { id: newId, ...req.body };
    toursData.push(newTour);
    fs.writeFile(
        dataPath,
        JSON.stringify(toursData, null, 2),
        err => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Was not able to update the tours data',
                });
            }
            res.status(201).json({
                status: 'success',
                data: { tour: newTour },
            });
        }
    );
};

const getTour = (req, res) => {
    const id = Number(req.params.id);
    const queryData = toursData.find(el => el.id === id);
    if (!queryData) {
        res.status(404).json({
            status: 'failed',
            message: 'Tour not found',
        });
    } else {
        res.status(200).json({
            status: 'success',
            data: { tour: queryData },
        });
    }
};

const updateTour = (req, res) => {
    const id = Number(req.params.id);
    const tourIndex = toursData.findIndex(el => el.id === id);
    if (tourIndex === -1) {
        return res.status(404).json({
            status: 'failed',
            message: 'Tour not found',
        });
    }
    toursData[tourIndex] = { ...toursData[tourIndex], ...req.body };
    fs.writeFile(
        dataPath,
        JSON.stringify(toursData, null, 2),
        err => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Was not able to update the tours data',
                });
            }
            res.status(200).json({
                status: 'success',
                data: { tour: toursData[tourIndex] },
            });
        }
    );
};

const deleteTour = (req, res) => {
    const id = Number(req.params.id);
    const tourIndex = toursData.findIndex(el => el.id === id);
    if (tourIndex === -1) {
        return res.status(404).json({
            status: 'failed',
            message: 'Tour not found',
        });
    }
    toursData.splice(tourIndex, 1);
    fs.writeFile(
        dataPath,
        JSON.stringify(toursData, null, 2),
        err => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Was not able to update the tours data',
                });
            }
            res.status(204).json({
                status: 'success',
                data: null,
            });
        }
    );
};

module.exports = {getAllTours ,createTour, getTour, updateTour,deleteTour}