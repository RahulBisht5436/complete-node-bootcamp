const express = require('express')
const { createUser, updateUser, getAllUsers, getUser, forgotPassword, resetPassword } = require('../controllers/userController')
const { deleteUser, updatePassword, signup, login, protect, updateMe, restrictTo } = require("./../controllers/authController")
// NOTE : Users Resource
const userRouter = express.Router() // this defines the way router will behave

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.delete('/deleteUser', protect, deleteUser);
userRouter.post('/forgotpassword', forgotPassword);
userRouter.patch('/resetpassword/:token', resetPassword);
userRouter.patch('/updatepassword', protect, updatePassword);
userRouter.post('/updateme', protect, updateMe)
userRouter.route('/')
  .get(getAllUsers)
  .post(createUser)
  .delete(protect, restrictTo('user'), deleteUser);

userRouter.route('/:id')
  .get(getUser)
  .patch(updateUser)

module.exports = userRouter