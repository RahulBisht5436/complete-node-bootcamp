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

module.exports = { deleteUser, createUser, updateUser, getAllUsers, getUser }