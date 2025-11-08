const express = require('express')
const { deleteUser, createUser, updateUser, getAllUsers, getUser } = require('../controllers/userController')
const { signup } = require("./../controllers/authController")
// NOTE : Users Resource
const userRouter = express.Router()
console.log("inside the router......")
userRouter.route('/').get(getAllUsers).post(createUser)
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)
userRouter.route('/signup').post(signup)

module.exports = userRouter