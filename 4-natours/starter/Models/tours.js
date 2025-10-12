const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        required: [true, 'A tour must have a name']
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']   
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    ratingAverage: {
        type: Number,
        default: 4.5
    },
    ratingQuantity: {
        type: Number,
        default: 0},
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
        type: String,
        required: [true, 'A tour must have a summary'],
        trim: true,
      },
    description: {
        type: String,
        trim: true
        },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']  
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),    
    },
    startDates: [Date]

    
})

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;