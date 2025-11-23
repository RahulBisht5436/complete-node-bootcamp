const {promisify} = require('util')
const User = require('./../Models/User');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const AppError = require('./../utils/appError')

const signinToken = async function (userId) {
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

    if (!user || !(await user.correctPassword(user.password, password))) {
        
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

const protect = catchAsync(async function protect(req, res, next) {
    // 1) First check if there is token or not \
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    }
    console.log("==================>>>>>>>>>>>",token)
    if(!token){
        console.log("inside the error handling function")
        return next(new AppError("You are not logged in , kindly login to get access ", 500))
    }
    
    // 2) if there is token then validate , if it is require or not 
    const decoded = await promisify( jwt.verify)(token,process.env.JWT_SECRET)
    console.log(decoded)
    // 3) and also check after token verification that the user still exist or not
    
    // 4) check if user changed password after the token is issued 



    next()
})

module.exports = { signup, login, protect }