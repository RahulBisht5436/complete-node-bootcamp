const express = require('express');
const { getOverview, getTourUI, login , logout } = require('./../controllers/viewController')
const { conditionalProtect } = require('./../controllers/authController')
const viewRouter = express.Router();

viewRouter.use(conditionalProtect)

viewRouter.route('/').get(getOverview)

viewRouter.route('/tours/:slug').get(getTourUI)

viewRouter.route('/login').get(login)

viewRouter.route('/logout').get(logout)

module.exports = viewRouter