// Import express
const express = require('express');

// Import user-related controller functions (not auth)
const {
  createUser,
  updateUser,
  getAllUsers,
  getUser,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/userController');

// Import authentication & authorization controllers
const {
  deleteUser,
  updatePassword,
  signup,
  login,
  protect,
  updateMe,
  restrictTo
} = require("./../controllers/authController");

// ------------------------------------------------------------
// Create router for user-related routes
// ------------------------------------------------------------
const userRouter = express.Router();  // Defines behavior for user route paths



// ------------------------------------------------------------
// AUTHENTICATION ROUTES
// ------------------------------------------------------------
userRouter.post('/signup', signup);                 // Create user account
userRouter.post('/login', login);                   // Login and get token

// Delete logged-in user's account (soft delete)
userRouter.delete('/deleteUser', protect, restrictTo('user'), deleteUser);

// Forgot password → sends reset token email
userRouter.post('/forgotpassword', forgotPassword);

// Reset password using token from email
userRouter.patch('/resetpassword/:token', protect, resetPassword);

// Update password (logged-in user only)
userRouter.patch('/updatepassword', protect, updatePassword);

// Update user profile (name/email only)
userRouter.post('/updateme', protect, updateMe);

// Give user profile Information
userRouter.get('/getMe', protect, getMe);


userRouter.use(restrictTo('admin')); // All routes after this are admin-only

// ------------------------------------------------------------
// MAIN USER ROUTE: /
// GET → Get all users
// POST → Create a user (admin-only ideally, but open here)
// DELETE → Delete logged-in user (restrict to 'user')
// ------------------------------------------------------------
userRouter
  .route('/')
  .get(getAllUsers)
  .post(createUser)
  .delete(
    protect,                  // Only user role can delete self
    deleteUser
  );


// ------------------------------------------------------------
// USER BY ID ROUTE: /:id
// GET → Get user by ID
// PATCH → Update user by ID
// ------------------------------------------------------------
userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser);



// Export router for use in app.js
module.exports = userRouter;
