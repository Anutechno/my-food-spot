const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require('validator');
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please Provide a Email Address'],
        validate: [validator.isEmail, 'Please enter email']
    },
    password: {
        type: String,
        required: [true, 'Please Enter password'],
    },
    name: {
        type: String,
        required: [true, 'Please Provide a Name'],
    },
    mob_no: {
        type: Number,
        required: true,
        minlength: 10,
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "restaurant", "deliveryboy"],
    },
    otp: {
        type: Number,
        default: 1111,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});

//encrypt pasword before save --Hooks
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// create and retunr jwt sign token 
UserSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Compare password validate the password with passed on user password
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
UserSchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //Hashing ans adding resetPasswordToken To UserSchema
    //Using "sha256" algorithm and use toString or digest to convert into hex string
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
        
//time of token
    this.resetPasswordExpire = Date.new() + 15 * 60 * 1000; //15 min
    return resetToken;
};

module.exports = mongoose.model("Users", UserSchema);