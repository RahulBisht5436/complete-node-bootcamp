const User = require('./../Models/User');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const AppError = require('./../utils/appError')

const signinToken = async function(userId){
     return await jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

const signup = catchAsync(async function signup(req, res, next) {
    // const newUser = await User.create(req.body);
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password_confirmed: req.body.password_confirmed
    });

    const token = await signinToken(newUser._id)

    // send single response
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

const login = catchAsync(async function login(req, res, next) {

    const { email, password } = req.body
    // check if email and password even exist
    if (!email || !password) {
        return next(new AppError("need to have email and password", 400))
    }

    // user exist and password exist
    const user = await User.findOne({
        email: email
    }).select('+password')

    console.log(await user.correctPassword(user.password, password))
    if (!user || !(await user.correctPassword(user.password, password))) {
        console.log("inside the else ahsdaudgiagdagdagdugdu")
        return next(new AppError(" Incorrect mail or password ", 401))
    }

    // if everthing is okay then send the token to the client
    token = await signinToken(user._id)
    res.status(200).json(
        {
            status: "success",
            token: token,
            message: `you are logged in to ${email} with the ${password} password`,

        }
    )
})


module.exports = { signup, login }