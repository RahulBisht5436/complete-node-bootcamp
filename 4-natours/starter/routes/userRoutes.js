const express = require('express')
const { deleteUser, createUser, updateUser, getAllUsers, getUser } = require('../controllers/userController')
const { signup , login } = require("./../controllers/authController")
// NOTE : Users Resource
const userRouter = express.Router()
userRouter.route('/').get(getAllUsers).post(createUser)
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)
userRouter.route('/signup').post(signup)
userRouter.route('/login').post(login)

module.exports = userRouter