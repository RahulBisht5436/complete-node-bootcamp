const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

// Read tours data once when server starts
const toursData = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

// NEW LOGIC GET tours
app.get('/api/v1/tours', (req, res) => {
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
});

// NEW LOGIC POST new tour
app.post('/api/v1/tours', (req, res) => {
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
});

// NEW LOGIC
app.get('/api/v1/tours/:id', (req, res) => {
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

});


// NEW LOGIC :  Making a path request
app.patch('/api/v1/tours/:id', (req, res) => {
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
    // NOTE : I have to update in the file 


})

app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
