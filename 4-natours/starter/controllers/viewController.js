// Importing the Tours model to interact with the MongoDB 'tours' collection
const { title } = require('process');
const Tours = require('./../Models/tours');

// Importing a utility function to handle async errors without using try/catch everywhere
const catchAsync = require('./../utils/catchAsync');

// Node.js built-in module to work with file and directory paths (not actually used below but imported)
const path = require('path');

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
        return res.status(200).render('overview', {
            data: allToursData,
            title :"Nature Explorer"
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
      return res.status(404).send("Tour Data is not Available");
    }

    return res.status(200).render('tour', {
       data: tourData,
       title : tourData.name 
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
};

// Exporting the functions so they can be used in viewRouter.js
module.exports = { getOverview, getTourUI };
