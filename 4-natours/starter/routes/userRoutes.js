const express = require('express')
const { deleteUser, createUser, updateUser, getAllUsers, getUser, forgotPassword, resetPassword } = require('../controllers/userController')
const { updatePassword,signup, login } = require("./../controllers/authController")
const { sendMail } = require("./../utils/email")
// NOTE : Users Resource
const userRouter = express.Router() // this defines the way router will behave

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.post('/forgotpassword', forgotPassword);
userRouter.patch('/resetpassword/:token', resetPassword);
userRouter.patch('/updatepassword', updatePassword);

userRouter.route('/')
  .get(getAllUsers)
  .post(createUser);

userRouter.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = userRouter