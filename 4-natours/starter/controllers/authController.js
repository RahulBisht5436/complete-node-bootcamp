const { promisify } = require('util')
const User = require('./../Models/User');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken')
const AppError = require('./../utils/appError');
const bcrypt = require("bcryptjs")

const signinToken = async function (userId) {
    return await jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

const signup = catchAsync(async function signup(req, res, next) {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password_confirmed: req.body.password_confirmed
    });
    sendToken(newUser, 201, res)
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

    if (!user || !(await user.correctPassword(password, user.password))) {

        return next(new AppError(" Incorrect mail or password ", 401))
    }

    // if everthing is okay then send the token to the client
    sendToken(user, 201, res)
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

const sendToken = async (user, statusCode, res) => {
    const token = await signinToken(user.id)
    res.status(statusCode).json(
        {
            status: "success",
            token,
            data: {
                user
            }
        }
    )
}

const updatePassword = catchAsync(async function updatePassword(req, res, next) {

    // 1. Validate original password input
    const originPassword = req.body.originpassword;

    if (!originPassword) {
        return next(new AppError("Original password is required", 401));
    }

    // 2. Extract JWT token from Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new AppError("You are not logged in. Please login to get access.", 401));
    }

    // 3. Verify token and extract user ID
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 4. Fetch user with password explicitly selected
    const user = await User.findById(userId).select("+password");
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // 5. Validate new password inputs
    const { newpassword, newpasswordconfirmed } = req.body;
    if (!newpassword || !newpasswordconfirmed) {
        return next(new AppError("New password and confirm password are required", 401));
    }
    if (!user.correctPassword(newpassword, user.password)) {
        return next(new AppError("Enter Password and Confirmed Password Do not match"), 401)
    }

    if (newpassword !== newpasswordconfirmed) {
        return next(new AppError("Passwords do not match", 400));
    }

    // 6. Verify original password with bcrypt
    const isPasswordCorrect = await bcrypt.compare(originPassword, user.password);

    if (!isPasswordCorrect) {
        return next(new AppError("Original password is incorrect", 401));
    }

    // 7. Update password and clear reset tokens
    user.password = newpassword;
    user.password_confirmed = newpasswordconfirmed;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // 8. Save updated user
    await user.save();

    // 9 login user
    sendToken(user, 200, res)
});

const updateMe = catchAsync(async function updateMe(req, res, next) {
    return res.status(200).json(
        {
            status: 'success',
            data: {

            }
        }
    )
}

)
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
module.exports = { signup, login, protect, restrictTo, updatePassword, updateMe } 