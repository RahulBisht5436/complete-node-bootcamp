const User = require('./../Models/User');
const catchAsync = require('../utils/catchAsync');

const signup = catchAsync(async function signup(req, res, next) {
    const newUser = await User.create(req.body);
    console.log(req.body)
    // send single response
    res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
    });
});

module.exports = { signup }