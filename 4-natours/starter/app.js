const express = require('express');
const fs = require('fs');
const app = express();
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
app.use(express.static(`${__dirname}/public`))

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json());
// parse application/x-www-form-urlencoded (for HTML form submissions / Postman form-data)
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {

    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
})
app.use(globalErrorHandler);
module.exports = app