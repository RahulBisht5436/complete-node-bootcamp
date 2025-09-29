const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');




app.use(morgan('dev'))
app.use(express.json());
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter);


module.exports = app