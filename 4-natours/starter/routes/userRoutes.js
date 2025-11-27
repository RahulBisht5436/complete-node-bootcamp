const express = require('express')
const { createUser, updateUser, getAllUsers, getUser, forgotPassword, resetPassword } = require('../controllers/userController')
const { deleteUser,updatePassword, signup, login, protect, updateMe} = require("./../controllers/authController")
// NOTE : Users Resource
const userRouter = express.Router() // this defines the way router will behave

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.delete('/deleteUser', protect,deleteUser);
userRouter.post('/forgotpassword', forgotPassword);
userRouter.patch('/resetpassword/:token', resetPassword);
userRouter.patch('/updatepassword', protect, updatePassword);
userRouter.post('/updateme', protect, updateMe)
userRouter.route('/')
  .get(getAllUsers)
  .post(createUser);

userRouter.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = userRouter