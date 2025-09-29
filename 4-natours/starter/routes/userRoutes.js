const express = require('express')
const {deleteUser,createUser,updateUser,getAllUsers,getUser} = require('../controllers/userController')
// NOTE : Users Resource
const userRouter = express.Router()

userRouter.route('/').get(getAllUsers).post(createUser)
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)


module.exports = userRouter