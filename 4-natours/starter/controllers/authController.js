const User = require('./../Models/User');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const AppError = require('./../utils/appError')

const signup = catchAsync(async function signup(req, res, next) {
    // const newUser = await User.create(req.body);
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password_confirmed: req.body.password_confirmed
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })

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

    const passwordConfirmed = await bcrypt.compare(password, user.password)
    let token;

    if (passwordConfirmed) {
        token = jwt.sign(
            { id: user._id }, // better to include user ID, not password
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
    } else {
        return next(new AppError("Invalid email or password", 401));
    }
    res.status(200).json(
        {
            status: "success",
            token: token,
            message: `you are logged in to ${email} with the ${password} password`,

        }
    )
})


module.exports = { signup, login }