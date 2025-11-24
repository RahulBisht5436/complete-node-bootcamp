const express = require('express')
const { deleteUser, createUser, updateUser, getAllUsers, getUser, forgotPassword, resetPassword } = require('../controllers/userController')
const { signup, login } = require("./../controllers/authController")
const { sendMail } = require("./../utils/email")
// NOTE : Users Resource
const userRouter = express.Router() // this defines the way router will behave

userRouter.route('/').get(getAllUsers).post(createUser)
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)
userRouter.route('/signup').post(signup)
userRouter.route('/login').post(login)
userRouter.route('/forgotpassword').post(forgotPassword)
userRouter.route('/resetpassword').post(resetPassword)

module.exports = userRouter