const express = require('express');
const { newBooking } = require('../controllers/bookingController')
const { getOverview, getTourUI, account, login, logout, resetPassword } = require('./../controllers/viewController')
const { conditionalProtect } = require('./../controllers/authController')
const viewRouter = express.Router();

viewRouter.use(conditionalProtect)

viewRouter.route('/').get(newBooking, getOverview)

viewRouter.route('/tours/:slug').get(getTourUI)

viewRouter.route('/login').get(login)

viewRouter.route('/logout').get(logout)

viewRouter.route('/account').get(account)

viewRouter.route('/resetPassword/:resetToken').get(resetPassword)

// NOTE need to understand why if we put a .all router handler here it breaks the login functionalityvie

module.exports = viewRouter