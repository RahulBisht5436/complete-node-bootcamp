const express = require('express');
const { getOverview , getTourUI , login} = require('./../controllers/viewController')
const {protect }= require('./../controllers/authController')
const viewRouter = express.Router();

viewRouter.route('/').get( getOverview )

viewRouter.route('/tours/:slug').get( protect,getTourUI )

viewRouter.route('/login').get(login)

module.exports = viewRouter