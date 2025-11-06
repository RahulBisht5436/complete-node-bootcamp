const sendErrorDev = (err, req, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, req, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    })
}

module.exports = (err, req, res, next) => {
    err.status = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        sendErrorProd(err, req, res);
    }
    res.json({
        status: err.status,
        message: err.message
    })
} 