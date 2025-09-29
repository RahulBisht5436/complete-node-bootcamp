const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan')


const port = 3000;
// LEARN : third party middleware function


// LEARN : middle-ware

app.use(morgan('dev'))
app.use(express.json());
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});
// Read tours data once when server starts
const toursData = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);
const getAllTours = (req, res) => {
    console.log(req.requestTime)
    if (toursData && toursData.length > 0) {
        res.status(200).json({
            status: 'success',
            results: toursData.length,
            data: {
                tours: toursData,
            },
        });
    } else {
        res.status(500).json({
            status: 'fail',
            message: 'Internal server error, no data found',
        });
    }
}
const getTour = (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            status: 'fail',
            message: 'Request body is empty',
        });
    }


    // Generate new ID
    const newId = toursData[toursData.length - 1].id + 1;
    const newTour = { id: newId, ...req.body };

    // Push into array
    toursData.push(newTour);

    // Save back to file
    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(toursData, null, 2), // pretty print JSON
        err => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Was not able to update the tours data',
                });
            }

            res.status(201).json({
                status: 'success',
                data: {
                    tour: newTour,
                },
            });
        }
    );
}
const addTour = (req, res) => {
    console.log(req.params.id)
    const queryData = toursData.find(el => el.id == req.params.id * 1)
    if (!queryData) {
        res.status(404).json({
            status: "failed",
            message: "not getting the data"
        })
    } else {
        console.log(queryData)
        res.status(200).json({
            status: 'success',
            data: {
                tour: queryData
            }
        })
    }

}
const updateTour = (req, res) => {
    const toursId = req.params.id
    if (!toursId) {
        res.status(400).json({
            status: "failed",
            message: "no ID provided"
        }
        )
    } else {
        res.status(200).json({
            status: "success",
            message: "data is update",
            data: {
                tour: "<data is updated>"
            }
        })
    }
}
const deleteTour = (req, res) => {
    const toursId = req.params.id
    if (!toursId) {
        res.status(400).json({
            status: "failed",
            message: "no ID provided"
        }
        )
    } else {
        res.status(204).json({
            status: "success",
            message: "data is deleted",
            data: {
                data: null
            }
        })
    }
}
const getAllUsers = (req,res)=>{
    res.json({
        status:'failed',
        message:'End point not ready'
    })
}
const createUser  = (req,res)=>{
    res.json({
        status:'failed',
        message:'End point not ready'
    })
}
const getUser     = (req,res)=>{
    res.json({
        status:'failed',
        message:'End point not ready'
    })
}
const updateUser  = (req,res)=>{
    res.json({
        status:'failed',
        message:'End point not ready'
    })
}
const deleteUser  = (req,res)=>{
    res.json({
        status:'failed',
        message:'End point not ready'
    })
}

// LEARN : new way of routing


// NOTE : tours resouce 

// LEARN : make use of express.Router()
const tourRouter = express.Router()
app.use('/api/v1/tours', tourRouter)

tourRouter.route('/').get(getAllTours).post(getTour)
tourRouter.route('/:id').get(addTour).patch(updateTour).delete(deleteTour)

// NOTE : Users Resource
const userRouter = express.Router()
app.use('/api/v1/users', userRouter);

userRouter.route('/').get(getAllUsers).post(createUser)
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
