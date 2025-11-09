const User = require('./../Models/User');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken')


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

module.exports = { signup }