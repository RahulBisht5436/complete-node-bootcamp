const express = require('express');
const { getOverview, getTourUI, login } = require('./../controllers/viewController')
const { conditionalProtect } = require('./../controllers/authController')
const viewRouter = express.Router();

viewRouter.use(conditionalProtect)

viewRouter.route('/').get(getOverview)

viewRouter.route('/tours/:slug').get(getTourUI)

viewRouter.route('/login').get(login)

module.exports = viewRouter