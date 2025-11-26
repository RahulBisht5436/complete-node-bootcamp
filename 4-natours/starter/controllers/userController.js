const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const jwt = require("jsonwebtoken")
const crypto = require('crypto')
const User = require('./../Models/User');

const signinToken = async function (userId) {
    return await jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

const getAllUsers = catchAsync(async function (req, res, next) {

    const allUSers = await User.find()
    res.status(200).json({
        status: "success",
        data: {
            allUSers
        }
    })
})
const createUser = (req, res) => {
    res.json({
        status: 'failed',
        message: 'End point not ready'
    })
}
const getUser = (req, res) => {
    res.json({
        status: 'failed',
        message: 'End point not ready'
    })
}
const updateUser = (req, res) => {
    res.json({
        status: 'failed',
        message: 'End point not ready'
    })
}
const deleteUser = (req, res) => {
    res.json({
        status: 'failed',
        message: 'End point not ready'
    })
}

const forgotPassword = catchAsync(async function (req, res, next) {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError("User email is wrong, kindly enter correct email", 404));
    }

    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

    const resetMessage = `Forgot your password? Submit new password using this link:\n\n${resetURL}\n\nIf you didn't request this, please ignore.`;

    try {
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
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError("Error sending email", 500));
    }
});


const resetPassword = catchAsync(async function (req, res, next) {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
        return next(new AppError("user is not found or token expired"), 401)
    }
    user.password = req.body.newpassword
    user.password_confirmed = req.body.newpasswordconfirmed
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save()
    const token = await signinToken(user.id)
    return res.status(200).json({
        message: "user updated successfully",
        status: "success",
        token
    })

})

module.exports = { deleteUser, createUser, updateUser, getAllUsers, getUser, forgotPassword, resetPassword }