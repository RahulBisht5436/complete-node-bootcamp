const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs")
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name "],
        trim: true,
        maxlength: [20, "Name cannot exceed 20 characters"]
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
    }
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.password_confirmed = undefined;
    next();
})


// INSTANCE METHOD
userSchema.methods.correctPassword = async function(candidatePassword, originalPassword){
    // here we can't use this.password as we have hidded it from the normal querying
    return await bcrypt.compare(originalPassword, candidatePassword);
}

const User = mongoose.model('User', userSchema);

module.exports = User;

