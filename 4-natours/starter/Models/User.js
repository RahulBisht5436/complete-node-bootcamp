const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs")
const crypto = require("crypto");
const { type } = require('os');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name "],
        trim: true,
        maxlength: [20, "Name cannot exceed 20 characters"]
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
        require: [true, "need to specify the role"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true, // good for consistency
        trim: true,
        validate: [validator.isEmail, "Kindly enter the Valid Email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        select: false // hides password when querying users
    },
    password_confirmed: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function (el) {
                return this.password === el
            },
            message: "Password need to be same as entered password"
        }
    },
    passwordChangedTime: {
        type: Date,
        require: [true, " need the time of change"],

    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type:Boolean,
        default:true
    }
});

userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedTime = Date.now() - 1000;
    next()
})

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.passwordChangedTime = Date.now()
    }
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.password_confirmed = undefined;
    next();
})

// INSTANCE METHOD


userSchema.methods.correctPassword = async function (candidatePassword, originalPassword) {
    // here we can't use this.password as we have hidded it from the normal querying
    return await bcrypt.compare(candidatePassword, originalPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (!this.passwordChangedTime) return false;
    const changedTimestamp = parseInt(this.passwordChangedTime.getTime() / 1000, 10);
    // If JWT was issued BEFORE password change => token invalid
    return JWTTimestamp < changedTimestamp;
};

userSchema.methods.createResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const crypData = crypto.createHash('sha256').update(resetToken).digest("hex");
    this.passwordResetToken = crypData;
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken

}

const User = mongoose.model('User', userSchema);

module.exports = User;

