// Import required modules
const { promisify } = require('util');              // Convert callback-based functions to promises
const User = require('./../Models/User');           // User model
const catchAsync = require('../utils/catchAsync');  // Wrapper to catch async errors
const jwt = require('jsonwebtoken');                // JWT library for signing/verifying tokens
const AppError = require('./../utils/appError');    // Custom error handler
const bcrypt = require("bcryptjs");                 // For hashing and comparing passwords



// ----------------------------------------------------
// Generate JWT Token for a given user ID
// ----------------------------------------------------
const signinToken = async function (userId) {
    return await jwt.sign(
        { id: userId },                     // Payload
        process.env.JWT_SECRET,             // Secret key
        { expiresIn: process.env.JWT_EXPIRE } // Token expiry
    );
};



// ----------------------------------------------------
// SIGNUP Controller - Create new user
// ----------------------------------------------------
const signup = catchAsync(async function signup(req, res, next) {

    // Create new user document in DB
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password_confirmed: req.body.password_confirmed
    });

    // Send JWT token to user
    sendToken(newUser, 201, res);
});



// ----------------------------------------------------
// LOGIN Controller - Authenticate user
// ----------------------------------------------------
const login = catchAsync(async function login(req, res, next) {

    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
        return next(new AppError("need to have email and password", 400));
    }

    // Find user by email and include password field
    const user = await User.findOne({ email: email }).select('+password');

    // Validate user and password
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError(" Incorrect mail or password ", 401));
    }

    // If everything is correct → send token
    sendToken(user, 201, res);
});



// ----------------------------------------------------
// PROTECT Middleware - Check login and validate token
// ----------------------------------------------------
const protect = catchAsync(async function protect(req, res, next) {

    // 1. Extract token from Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    }

    // If no token found
    if (!token) {
        return next(new AppError("You are not logged in , kindly login to get access ", 500));
    }

    // 2. Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError("User is deleted , kindly create a new user", 401));
    }

    // 4. Check if user changed password after token was issued
    const changePassword = freshUser.changedPasswordAfter(decoded.iat);
    if (changePassword) {
        return next(new AppError("Password Changed Afterword kindly initiate new session ", 401));
    }

    // Grant access to protected route
    req.user = freshUser;
    next();
});



// ----------------------------------------------------
// Helper Function - Create token & send response
// ----------------------------------------------------
const sendToken = async (user, statusCode, res) => {

    // Generate JWT token
    const token = await signinToken(user.id);

    // Cookie options
    const cookiesOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true      // Cannot be accessed by JavaScript
    };

    // Secure cookie only in production
    if (process.env.NODE_ENV === 'production') {
        cookiesOptions.secure = true;
    }

    // Send cookie to browser
    res.cookie('jwt', token, cookiesOptions);

    // Remove password from output
    user.password = "undefined";

    // Send response
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    });
};



// ----------------------------------------------------
// UPDATE PASSWORD Controller
// User must be logged in & provide old password
// ----------------------------------------------------
const updatePassword = catchAsync(async function updatePassword(req, res, next) {

    // 1. Check if original password is provided
    const originPassword = req.body.originpassword;
    if (!originPassword) {
        return next(new AppError("Original password is required", 401));
    }

    // 2. Extract JWT token from headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new AppError("You are not logged in. Please login to get access.", 401));
    }

    // 3. Verify token & get user ID
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 4. Fetch user with password
    const user = await User.findById(userId).select("+password");
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // 5. Validate new password fields
    const { newpassword, newpasswordconfirmed } = req.body;

    if (!newpassword || !newpasswordconfirmed) {
        return next(new AppError("New password and confirm password are required", 401));
    }

    // Check if user mistakenly entered old password as new one
    if (!user.correctPassword(newpassword, user.password)) {
        return next(new AppError("Enter Password and Confirmed Password Do not match"), 401);
    }

    // Ensure new passwords match each other
    if (newpassword !== newpasswordconfirmed) {
        return next(new AppError("Passwords do not match", 400));
    }

    // 6. Compare original password with database password
    const isPasswordCorrect = await bcrypt.compare(originPassword, user.password);
    if (!isPasswordCorrect) {
        return next(new AppError("Original password is incorrect", 401));
    }

    // 7. Update user password
    user.password = newpassword;
    user.password_confirmed = newpasswordconfirmed;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // 8. Save changes
    await user.save();

    // 9. Log in user again, send token
    sendToken(user, 200, res);
});



// ----------------------------------------------------
// UPDATE USER PROFILE (name/email only)
// ----------------------------------------------------
const updateMe = catchAsync(async function updateMe(req, res, next) {

    const user = req.user;

    // If user not attached by protect()
    if (!user) {
        return next(new AppError("Can't identify user credential , kindly login again"), 401);
    }

    // Extract allowed fields
    const { name, email, role } = req.body;

    // Update DB entry
    data = await User.findByIdAndUpdate(
        user.id,
        { name, email },
        { new: true, runValidators: true }
    );

    // Return updated user
    return res.status(200).json({
        status: 'success',
        data: { data }
    });
});



// ----------------------------------------------------
// restrictTo Middleware (Role-based Authorization)
// ----------------------------------------------------
const restrictTo = (...roles) => {
    return catchAsync(async (req, res, next) => {

        // Extract token
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return next(new AppError("You are not logged in , kindly login to get access ", 500));
        }

        // Verify token
        let decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        let userId = decoded.id;

        // Get user
        let user = await User.findById(userId);

        // Check if user role allowed
        if (!roles.includes(user.role)) {
            return next(new AppError("user doest have valid authority , login with other account ", 401));
        }

        next();
    });
};



// ----------------------------------------------------
// DELETE USER (Soft delete → mark active status)
// ----------------------------------------------------
const deleteUser = catchAsync(async function deleteUser(req, res, next) {

    // Must be logged in via protect()
    if (!req.user) {
        return next(new AppError("No User Found"), 401);
    }

    // Update active status instead of deleting
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { active: req.body.active },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: "success",
        data: { user }
    });
});



// Export controllers
module.exports = {
    signup,
    login,
    protect,
    restrictTo,
    updatePassword,
    updateMe,
    deleteUser
};
