// -------------------------------
// IMPORTS
// -------------------------------
const express = require('express');
const app = express();


// Core Node.js module used to work with file and directory paths safely
const path = require('path');

// Tell Express that we want to use Pug as the template (view) engine
app.set('view engine', 'pug');

// Tell Express where our Pug template files are located
// __dirname gives the absolute path of the current file's directory
// path.join(...) safely creates a full path to the 'views' folder
app.set('views', path.join(__dirname, 'views'));


// 1) Serve static files from "public" folder
// E.g. CSS, Images, Client-Side JS → available at domain.com/file.jpg
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));


const morgan = require('morgan');
const helmet = require('helmet');                    // Security headers
const mongoSanitize = require('express-mongo-sanitize'); // Prevent NoSQL injection
const xss = require('xss-clean');                   // Prevent XSS attacks
const rateLimiter = require('express-rate-limit');  // Prevent brute-force attacks
const hpp = require('hpp')                          // use to handle the parameter pollution
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const viewRouter = require('./routes/viewRouter')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// -------------------------------
// GLOBAL MIDDLEWARES (with explanations)
// -------------------------------


// 2) Set Security HTTP Headers
// Adds several security headers like:
// - X-DNS-Prefetch-Control
// - Strict-Transport-Security
// - X-Frame-Options (Prevents clickjacking)
// - X-XSS-Protection
// Whitelist external sources for Leaflet + OSM + Fonts


const scriptSrcUrls = [
    "https://unpkg.com",
    "https://*.tile.openstreetmap.org"
];

const styleSrcUrls = [
    "https://unpkg.com",
    "https://fonts.googleapis.com"
];

const fontSrcUrls = [
    "https://fonts.gstatic.com"
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],

            connectSrc: ["'self'", ...scriptSrcUrls],

            scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],

            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],

            // 👇 THIS IS NEW (Tile images allowed!)
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https://*.tile.openstreetmap.org"
            ],

            fontSrc: ["'self'", ...fontSrcUrls]
        }
    })
);




// 3) Development request logging
// Logs method, status code, response time, etc.
// Example log: GET /api/v1/users 200 15ms
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(hpp({
    whitelist: [
        'duration'
    ]
}))

// 4) Rate Limiting (Protect from brute-force & API abuse)
// Allows max 100 requests per IP per hour for routes starting with /api
const limiter = rateLimiter({
    max: 100,                                      // Limit each IP
    windowMs: 60 * 60 * 1000,                      // 1 hour
    message: "Too many requests from this IP, try again in an hour."
});
app.use('/api', limiter);


// 5) Body Parser – JSON
// Converts incoming JSON data into req.body
// Limit prevents very large requests (security & performance)
app.use(express.json({ limit: '100kb' }));


// 6) Body Parser – URL-encoded (Form submissions)
// Parses data from <form> submissions or Postman x-www-form-urlencoded requests
app.use(express.urlencoded({ extended: true }));


// 7) Data Sanitization Against NoSQL Injection
// Prevents users from sending malicious MongoDB operators like:
// { "email": { "$gt": "" } }
app.use(mongoSanitize());


// 8) Data Sanitization Against XSS
// Cleans user input from malicious HTML/JS
// Example: removes <script>alert("hacked")</script>
app.use(xss());


// 9) Add request timestamp
// Makes req.requestTime available in routes (useful for logs)
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});


// -------------------------------
// API ROUTES
// -------------------------------
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);


// -------------------------------
// HANDLE UNDEFINED ROUTES
// -------------------------------
// Any request that doesn't match any route hits this middleware.
app.all('*', (req, res, next) => {
    res.status(404).send("ajkshduyay")
    // next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});




// -------------------------------
// GLOBAL ERROR HANDLER
// -------------------------------
// Catches all errors thrown anywhere in the app
app.use(globalErrorHandler);


// -------------------------------
// EXPORT APP
// -------------------------------
module.exports = app;
