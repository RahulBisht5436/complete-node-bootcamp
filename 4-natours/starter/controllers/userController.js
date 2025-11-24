const AppError = require('../utils/appError');
const {sendEmail} = require('../utils/email');
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

    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${tempPassword}`
    const resetMessage = `If you forget your password then submit new passowrd in the url : ${resetURL} , you haven't kindly ignore this email`

    console.log("Script is Excuted till here",user.email)
    try {
        await sendEmail({
            email: user.email,
            subject:"data is only valid upto 10 mins",
            text:"Reset your Email password"

        })
        return res.status(200).json({
            "message": "temp password set kindly check the mail"
        })
        
    } catch (error) {
        user.createResetPasswordToken=undefined
        user.passwordResetExpires=undefined
        user.save({validateBeforeSave:false})
        return next( new AppError("Error in Sending the Email"),500)
    }
    
})

const resetPassword = catchAsync( async function(req,res,next){
    return 
})

module.exports = { deleteUser, createUser, updateUser, getAllUsers, getUser, forgotPassword, resetPassword }