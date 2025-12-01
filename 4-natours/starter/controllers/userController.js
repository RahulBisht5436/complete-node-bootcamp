// Importing required utilities and modules
const AppError = require('../utils/appError');           // Custom error handler class
const { sendEmail } = require('../utils/email');         // Email sending utility
const catchAsync = require('../utils/catchAsync');       // Wrapper to catch async errors
const jwt = require("jsonwebtoken");                     // JWT library for token generation
const crypto = require('crypto');                        // Node crypto for hashing reset token
const User = require('./../Models/User');                // User model
const { deleteOne } = require('./handlerFactory');       // Factory function (not used directly here)



// ---------------------------------------------
// FUNCTION: Generate JWT token for a user ID
// ---------------------------------------------
const signinToken = async function (userId) {
    return await jwt.sign(
        { id: userId },                // Payload: user ID
        process.env.JWT_SECRET,        // Secret key
        {
            expiresIn: process.env.JWT_EXPIRE   // Expiration time for token
        }
    );
};



// ---------------------------------------------
// CONTROLLER: Get all users
// ---------------------------------------------
const getAllUsers = catchAsync(async function (req, res, next) {
    const allUsers = await User.find();      // Fetch all users from DB

    res.status(200).json({
        status: "success",
        data: {
            allUsers
        }
    });
});



// ---------------------------------------------
// PLACEHOLDER CONTROLLERS — NOT IMPLEMENTED
// ---------------------------------------------
const createUser = (req, res) => {
    res.json({
        status: 'failed',
        message: 'End point not ready'
    });
};

const getUser = (req, res) => {
    res.json({
        status: 'failed',
        message: 'End point not ready'
    });
};

const updateUser = (req, res) => {
    res.json({
        status: 'failed',
        message: 'End point not ready'
    });
};

const deleteUser = deleteOne(User);



// ---------------------------------------------
// CONTROLLER: Forgot Password
// Generates reset token & emails reset link
// ---------------------------------------------
const forgotPassword = catchAsync(async function (req, res, next) {

    // Find user by submitted email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError("User email is wrong, kindly enter correct email", 404));
    }

    // Generate reset token & add hashed token fields to user
    const resetToken = user.createResetPasswordToken();

    // Save user without running validations
    await user.save({ validateBeforeSave: false });

    // URL to send to user's email
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

    // Message body sent via email
    const resetMessage = `Forgot your password? Submit new password using this link:\n\n${resetURL}\n\nIf you didn't request this, please ignore.`;

    try {
        // Attempt to send reset email
        await sendEmail({
            email: user.email,
            subject: "Password reset valid for 10 minutes",
            text: resetMessage
        });

        res.status(200).json({
            status: "success",
            message: "Reset link sent to email"
        });

    } catch (err) {

        // If email fails, remove reset token fields
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError("Error sending email", 500));
    }
});



// ---------------------------------------------
// CONTROLLER: Reset Password
// Validates token, updates password
// ---------------------------------------------
const resetPassword = catchAsync(async function (req, res, next) {

    // Hash token because DB stores hashed version
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    // Find user with valid token and token not expired
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }   // Check expiration
    });

    if (!user) {
        return next(new AppError("user is not found or token expired"), 401);
    }

    // Set new password fields
    user.password = req.body.newpassword;
    user.password_confirmed = req.body.newpasswordconfirmed;

    // Clear reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Save user with new password
    await user.save();

    // Generate new login token after successful reset
    const token = await signinToken(user.id);

    return res.status(200).json({
        message: "user updated successfully",
        status: "success",
        token
    });
});



// ---------------------------------------------
// EXPORT ALL CONTROLLERS
// ---------------------------------------------
module.exports = {
    deleteUser,
    createUser,
    updateUser,
    getAllUsers,
    getUser,
    forgotPassword,
    resetPassword
};
