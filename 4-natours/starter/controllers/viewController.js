// Importing the Tours model to interact with the MongoDB 'tours' collection
const { title } = require('process');
const Tours = require('./../Models/tours');
const Bookings = require('./../Models/bookingModels');
// Importing a utility function to handle async errors without using try/catch everywhere
const catchAsync = require('./../utils/catchAsync');

// Node.js built-in module to work with file and directory paths (not actually used below but imported)
const path = require('path');
const { token } = require('morgan');

/**
 * ===============================
 * CONTROLLER : getOverview
 * ===============================
 * This function will:
 *  1️⃣ Fetch all tours from the database
 *  2️⃣ Render the "overview" PUG template/view
 *  3️⃣ Pass the fetched tours data to the template
 */
const getOverview = catchAsync(
  async (req, res) => {
    // Get all tour documents from the Tours collection
    const allToursData = await Tours.find();

    // Render the overview.pug view with the data
    res.locals.userData = req.user
    return res.status(200).render('overview', {
      data: allToursData,
      title: "Nature Explorer"
    });
  }
);


/**
 * ===============================
 * CONTROLLER : getTourUI
 * ===============================
 * This function will:
 *  1️⃣ Read the tour slug from the URL (req.params.slug)
 *  2️⃣ Find the matching tour in the database
 *  3️⃣ If found → Render the "tour" page with data
 *  4️⃣ If not found → Send 404 "not available" message
 */
const getTourUI = async (req, res) => {
  try {
    const tourSlug = req.params.slug;

    const tourData = await Tours.findOne({ slug: tourSlug })
      .populate({ path: 'reviews', select: 'review rating user' })
      .lean();

    if (!tourData) {
      return res.status(404).render('error.pug', {
        title: "No Tour found",
        message: "No Tour Found"
      })
    }

    return res.status(200).render('tour', {
      data: tourData,
      title: tourData.name
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
};

const login = catchAsync(async (req, res, next) => {
  return res.status(200).render('login', {
    title: "Login Page"
  })
})

const logout = catchAsync(async (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  }
  if (process.env.NODE_ENV == "production") {
    cookieOptions.secure = true
  }
  res.cookie('jwt', "", cookieOptions)
  return res.status(200).json({
    'status': "success",
    'statusCode': 200,
    "token": ''
  })
})

const account = async function (req, res, next) {
  const userObject = req.user
  res.status(200).render('account', {
    title: "account",
    user: userObject
  })

}

const resetPassword = catchAsync(async (req, res) => {
  // console.log(user)
  return res.render('passwordReset')
})


const myTours = catchAsync(async (req, res) => {
  const user = req.user
  const bookingData = await Bookings.find({ user: user._id })
  const tourIds = bookingData.map(booking => booking.tour)
  const tours = await Tours.find({ _id: { $in: tourIds } })
  res.status(200).render('overview', {
    data: tours,
    title: "My Tours"
  })

})

// Exporting the functions so they can be used in viewRouter.js
module.exports = { getOverview, getTourUI, login, logout, account, resetPassword, myTours };
