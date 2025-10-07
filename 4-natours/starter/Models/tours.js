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
    maxFroupSize: {
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
        trim: true
      },
})

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;