const path = require('path');
const Tour = require('../Models/tours');
const { json } = require('express');
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

class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        console.log('filter function called successfully');
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);
        let appendedObject = JSON.stringify(queryObj);
        appendedObject = appendedObject.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        this.query = this.query.find(JSON.parse(appendedObject));
        return this;
        // const query =  Tour.find(
        //     JSON.parse(appendedObject)
        // );
    }

    sort(){
        console.log('sort function called successfully');
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        return this;
    }

    limitFields(){
        console.log('limitFields function called successfully');
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query.select(fields);
        }
        return this;
    }
    paginate(){
        console.log('paginate function called successfully');
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit);

        return this;
    }
}


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

module.exports = { getAllTours, createTour, getTour, updateTour, deleteTour , alaisTopTours };