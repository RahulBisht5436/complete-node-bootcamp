const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");


// ------------------------------------------------------------
// USER SCHEMA
// Defines authentication fields, validation, password encryption,
// password reset tokens, and user activation state.
// ------------------------------------------------------------
const userSchema = new mongoose.Schema({

    // User's full name
    name: {
        type: String,
        required: [true, "Please tell us your name "],
        trim: true,
        maxlength: [20, "Name cannot exceed 20 characters"]
    },

    // Role for authorization
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
        require: [true, "need to specify the role"]
    },

    // Email address (unique & validated)
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,           // Normalize email
        trim: true,
        validate: [validator.isEmail, "Kindly enter the Valid Email"]
    },

    // Encrypted password (never returned to client)
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        select: false              // Do not include password in results
    },

    // Confirmation password (only for validation, not stored)
    password_confirmed: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function (el) {
                return this.password === el;   // Confirm match
            },
            message: "Password need to be same as entered password"
        }
    },

    // Time when password was changed (for JWT invalidation)
    passwordChangedTime: {
        type: Date,
        require: [true, " need the time of change"]
    },

    // Random reset token (hashed)
    passwordResetToken: String,

    // Expiry of reset token (10 minutes)
    passwordResetExpires: Date,

    // Soft delete flag (active or deactivated)
    active: {
        type: Boolean,
        default: true,
        select: false              // Hide from API responses
    },

    // User profile photo filename
    photo: {
        type: String,
        default: 'default.jpg'     // Default photo if none uploaded
    }
});


// ------------------------------------------------------------
// DOCUMENT MIDDLEWARE (runs before .save())
// If password was modified, set passwordChangedTime
// ------------------------------------------------------------
userSchema.pre("save", function (next) {
    // Skip if password is not modified OR user is new
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedTime = Date.now() - 1000; // Subtract 1s for token sync
    next();
});


// ------------------------------------------------------------
// QUERY MIDDLEWARE (runs before find queries)
// Automatically filter out inactive users
// ------------------------------------------------------------
userSchema.pre(/^find/, function (next) {
    // Only return users where active !== false
    this.find({ active: { $ne: false } });
    next();
});


// ------------------------------------------------------------
// DOCUMENT MIDDLEWARE
// Update passwordChangedTime again if password actually changed
// ------------------------------------------------------------
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.passwordChangedTime = Date.now();
    }
});


// ------------------------------------------------------------
// HASH PASSWORD BEFORE SAVING
// This runs only when password is modified
// ------------------------------------------------------------
userSchema.pre("save", async function (next) {

    // If password wasn't modified → exit
    if (!this.isModified("password")) {
        return next();
    }

    // Encrypt password with cost factor 12
    this.password = await bcrypt.hash(this.password, 12);

    // Remove confirm password field from DB
    this.password_confirmed = undefined;

    next();
});


// ------------------------------------------------------------
// INSTANCE METHODS
// These methods are available on all User documents
// ------------------------------------------------------------

// Validate password during login
userSchema.methods.correctPassword = async function (candidatePassword, originalPassword) {
    // Compare entered password with stored hash
    return await bcrypt.compare(candidatePassword, originalPassword);
};


// Check if password was changed AFTER token was issued
// If yes → token becomes invalid
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (!this.passwordChangedTime) return false;

    const changedTimestamp = parseInt(this.passwordChangedTime.getTime() / 1000, 10);

    // Return true if token is older than password change time
    return JWTTimestamp < changedTimestamp;
};


// Generate password reset token (unhashed)
// Save hashed version in DB
userSchema.methods.createResetPasswordToken = function () {

    // Generate random reset token (unhashed)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token for storing in DB
    const crypData = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest("hex");

    this.passwordResetToken = crypData;

    // Token expires in 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken; // return unhashed version to email to user
};


// ------------------------------------------------------------
// MODEL CREATION
// ------------------------------------------------------------
const User = mongoose.model('User', userSchema);

// Export model
module.exports = User;
