// NOTE : handling uncaught exceptions
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});


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

const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// NOTE unhandled rejection handling globally
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
});

