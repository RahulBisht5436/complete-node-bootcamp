const express = require("express")
const bookingRouter = express.Router();
const { protect } = require("../controllers/authController")
const { createCheckoutSession } = require("../controllers/bookingController")

bookingRouter.use(protect)


bookingRouter.get('/checkout-session/:tourId', createCheckoutSession)
module.exports = bookingRouter 