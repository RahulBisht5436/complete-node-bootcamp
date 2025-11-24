const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('./../Models/User');
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

const forgotPassword = catchAsync(async function forgotPassword(req, res, next) {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError("User email is wrong , kindly enter the correct mail", 404))
    }
    const tempPassword = await user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false }); // this skips the validation process 

    return res.status(200).json({
        "message": "temp password set kindly check the mail"
    })
})

const resetPassword = catchAsync(async function resetPassword(req, res, next) {

    retrun
})
module.exports = { deleteUser, createUser, updateUser, getAllUsers, getUser, forgotPassword, resetPassword }