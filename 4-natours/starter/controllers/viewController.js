const Tours = require('./../Models/tours')
const catchAsync = require('./../utils/catchAsync')
const path  =  require('path')
// get Tours data from the collection

// Build the template

// Render that template using the data from the collection


const getOverview = catchAsync(
    async (req, res) => {
        const allToursData = await Tours.find();
        return res.status(200).render('overview', {
            data : allToursData,
            absoulePath : path.join(__dirname,'public/img')
        })
    }
)

const getTourUI = (req, res) => {
    return res.status(200).render('tour', {
        title: "Forest Hiker"
    })
}

module.exports = { getOverview, getTourUI }