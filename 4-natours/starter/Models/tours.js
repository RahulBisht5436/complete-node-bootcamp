const mongoose = require('mongoose');
const slugify = require('slugify');


// ------------------------------------------------------------
// TOUR SCHEMA
// Defines structure, validation, referencing & geospatial fields
// ------------------------------------------------------------
const tourSchema = new mongoose.Schema({
    // Name of the tour
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'Name ≤ 40 chars'],
        minlength: [10, 'Name ≥ 10 chars']
    },

    // Secret tours (hidden from responses)
    secreteTours: {
        type: Boolean,
        default: false
    },

    // URL-friendly version of the tour name
    slug: String,

    // Duration of the tour (in days)
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },

    // Max number of people allowed in the group
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have group size']
    },

    // Difficulty level
    difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'difficult']
    },

    // Average rating (rounded to one decimal)
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: 1,
        max: 5,
        set: val => Math.round(val * 10) / 10  // e.g., 4.666 → 4.7
    },

    // Number of ratings
    ratingQuantity: {
        type: Number,
        default: 0
    },

    // Tour price
    price: {
        type: Number,
        required: true
    },

    // Discount → must be less than price
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: "Discount must be less than price"
        }
    },

    // Short description of the tour
    summary: {
        type: String,
        trim: true,
        required: true
    },

    // Detailed description
    description: {
        type: String,
        trim: true
    },

    // Main cover image
    imageCover: {
        type: String,
        required: true
    },

    // Array of additional images
    images: [String],

    // Timestamp of creation
    createdAt: {
        type: Date,
        default: Date.now()
    },

    // Available start dates
    startDates: [Date],


    // --------------------------------------------------------
    // GEO SPATIAL FIELD (Start location)
    // --------------------------------------------------------
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']          // GeoJSON type
        },
        coordinates: [Number],        // [longitude, latitude]
        address: String,
        description: String
    },

    // GeoJSON locations throughout the tour route
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number               // Day of the tour at this point
        }
    ],


    // --------------------------------------------------------
    // GUIDES - REFERENCING
    // Array of user IDs of guides for this tour
    // --------------------------------------------------------
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]

}, {
    toJSON: { virtuals: true },      // Allow virtual fields in output JSON
    toObject: { virtuals: true }     // Allow virtual fields in plain object
});



// ------------------------------------------------------------
// DOCUMENT MIDDLEWARE (Runs before .save())
// Creates a slug from tour name
// ------------------------------------------------------------
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});



// ------------------------------------------------------------
// AGGREGATION MIDDLEWARE
// Excludes secret tours from all aggregation pipelines
// ------------------------------------------------------------

// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secreteTours: { $ne: true } } });
//     if(process.env.NODE_ENV==='development'){
//     }

//     next();
// });



// ------------------------------------------------------------
// QUERY MIDDLEWARE (Runs before any find query)
// Populate guides data (reference to User model)
// ------------------------------------------------------------
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'    // Exclude sensitive fields
    });
    next();
});



// ------------------------------------------------------------
// VIRTUAL POPULATE
// Allows Tour.reviews to include all Review documents
// where review.tour === tour._id
// ------------------------------------------------------------
tourSchema.virtual('reviews', {
    ref: 'Review',           // Model to populate from
    foreignField: 'tour',    // In Review model: tour: { ObjectId }
    localField: '_id'        // Match with tour._id
});



// ------------------------------------------------------------
// VIRTUAL FIELD (Derived value)
// durationWeeks → duration in weeks instead of days
// ------------------------------------------------------------

tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });
// it tells mongoose to create a special geospatial index
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});



// Export Tour model
module.exports = mongoose.model('Tour', tourSchema);
