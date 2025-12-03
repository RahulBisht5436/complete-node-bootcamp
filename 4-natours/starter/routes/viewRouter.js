const express = require('express');
const { getOverview , getTourUI } = require('./../controllers/viewController')
const viewRouter = express.Router();

viewRouter.route('/').get( getOverview )

viewRouter.route('/tour').get( getTourUI )

module.exports = viewRouter