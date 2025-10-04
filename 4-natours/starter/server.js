const app = require('./app')
const mongoose = require('mongoose');
// LEARN : this is new way to set environment variables
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
    '<db_password>',
    process.env.DATABASE_PASSWORD
);
const port = process.env.PORT || 3000;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then((con) => {
        console.log('DB connection successful!');
    }).catch((err) => {
        console.log(err);
        console.log('DB connection failed!');
    });

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        required: [true, 'A tour must have a name']
    },
    rating: {
        type: Number,
        default: 4.5,
        required: [true, 'A tour must have a rating']
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    }
})

const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
    name: 'The Forest Hiker12',
    rating: 4.7,
    price: 497
})
testTour.save();

app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});