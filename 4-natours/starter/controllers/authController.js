const { promisify } = require('util')
const User = require('./../Models/User');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken')
const AppError = require('./../utils/appError');

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
    if (!token) {
        return next(new AppError("You are not logged in , kindly login to get access ", 500))
    }

    // 2) if there is token then validate , if it is require or not 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // 3) and also check after token verification that the user still exist or not
    // console.log(decode)
    const freshUser = await User.findById(decoded.id)

    if (!freshUser) {
        return next(new AppError("User is deleted , kindly create a new user", 401))
    }

    // 4) check if user changed password after the token is issued 
    const changePassword = freshUser.changedPasswordAfter(decoded.iat)
    if (changePassword) {
        next(new AppError("Password Changed Afterword kindly initiate new session ", 401))
    }

    req.user = freshUser
    next()
})

const updatePassword = catchAsync( async function updatePassword(req,res,next) {
    console.log("--------------->>>")
        let token;
        console.log(req.headers.authorization,"authorization header data")
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return next(new AppError("You are not logged in , kindly login to get access ", 500))
        }


        console.log(token,"=======JWT token")
        let decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
        let userId = decoded.id

        user = await User.findById(userId)
        if(!req.body.newpassword || !req.body.newpasswordconfirmed){
            return next(new AppError("passord and confirmed password is needed"),401)
        }
        
        user.password = req.body.newpassword
        user.password_confirmed = req.body.newpasswordconfirmed
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined

        await user.save()
        return res.status(200).json({
            status:"successful",
            message:"password is updated successfully",
            token
        })
})

// this is a middleware factory function style
const restrictTo = (...roles) => {
    return catchAsync(async (req, res, next) => {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return next(new AppError("You are not logged in , kindly login to get access ", 500))
        }
        let decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
        let userId = decoded.id
        let user = await User.findById(userId)
        if (!roles.includes(user.role)) {
            next(new AppError("user doest have valid authority , login with other account ", 401))
        }
        next()
    })
}
module.exports = { signup, login, protect, restrictTo ,updatePassword } 