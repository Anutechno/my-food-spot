const Users = require("../models/userModel");
const Token = require("../Utils/jwtToken");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const crypto = require("crypto");
var jwt = require("jsonwebtoken");
const mailHelper = require("../Utils/emailHelper");

// Uer register in database
exports.registerUser = catchAsyncErrors(async (req, res) => {
    console.log(req.body);
    try {
        const { email, role } = req.body;
        const name = await Users.findOne({ email: email, role: role });
        if (name) {
            res.status(400).json({ mesaage: "User Already exist" });
        }
        const user = await Users(req.body);
        await user.save();
        res.status(200).json({ data: user, mesaage: "user signup Succesfull" });
    } catch (err) {
        res.status(400).json({ data: err, mesaage: "Error" });
    }
});

//User login in database
exports.loginUser = catchAsyncErrors(async (req, res) => {
    try {

        console.log(req.body);

        const { email, password, role } = req.body;

        if (!email || !password) {
            res
                .status(400)
                .json({ data: email, mesaage: "please enter and password" });
        }

        const userEmailPass = await Users.findOne({ email: email }).select(
            "+password"
        );

        if (!userEmailPass) {
            res
                .status(401)
                .json({ data: email, mesaage: "Envalid email and password" });
        }

        const isMatchPass = await userEmailPass.comparePassword(password);
        if (!isMatchPass) {
            res.status(401).json({
                data: isMatchPass,
                mesaage: "please enter current email and password",
            });
        } else {
            const token = jwt.sign({ id: userEmailPass._id, email: userEmailPass.email, role: userEmailPass.role }, process.env.JWT_SECRET, {
                expiresIn: 20,
            })
            console.log("ismatched: ", isMatchPass);
            res
                .status(200).cookie("token", token)
                .json({ data: userEmailPass, mesaage: "user signin Successfull" });
        }

    } catch (err) {
        res.status(400).json({ error: err })
    }


});

//User logout in database
exports.logoutUser = catchAsyncErrors(async (req, res) => {
    try {
        const { email } = req.body;
        const Userdata = await Users.findOne({ email: email });
        console.log("info", Userdata);
        res
            .status(200)
            .clearCookie("token", null)
            .json({ data: Userdata, mesaage: "user logout seccessfully" });
    } catch (err) {
        res.status(400).json({ data: err, mesaage: "Error" });
    }
});

//get user in database
exports.getUser = catchAsyncErrors(async (req, res) => {
    try {
        const { email } = req.body;
        const Userdata = await Users.findOne({ email: email });

        if (!Userdata) {
            res.status(400).json({ mesaage: "User not found " });
            return;
        }
        res
            .status(200)
            .json({ data: Userdata, mesaage: "Get user details Succesfull" });
    } catch (error) {
        res.status(400).json({ data: err, mesaage: "Error" });
    }
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await Users.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHander("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHander("password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

// updateProfile
exports.updateProfile = catchAsyncErrors(async (req, res) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
        };
        const userName = await Users.findById(req.params.id, newUserData, {
            new: true,
        });
        console.log(userName);

        if (!userName) {
            res.status(400).json({ mesaage: "User not found " });
            return;
        } else {
            const user = await Users.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
            });
            console.log(user);

            res
                .status(200)
                .json({ data: user, mesaage: "Update user details Succesfull" });
        }
    } catch (err) {
        res.status(400).json({ data: err, mesaage: "Update Error" });
    }
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await Users.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHander("User not found", 404));
    }

    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
    )}/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHander(error.message, 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // creating token hash
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await Users.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new ErrorHander(
                "Reset Password Token is invalid or has been expired",
                400
            )
        );
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHander("Password does not password", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});

exports.forgpass = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    const user = Users.findOne({ email })

    if (!user) {
        return next(new Error('Email not find', 400))
    }
    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false })
    const myUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`

    const message = `Copy past this link in your URL and hit enter \n\n ${myUrl}`

    try {
        await mailHelper({
            email: user.email,
            subject: "Password reset email",
            message,
        })
        res.status(200).json({
            success: true,
            message: "Email sent successfully",
        })

    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false })
        return next(new Error(error.mesaage, 500))
    }


})

// getAllUser
exports.getAllUser = catchAsyncErrors(async (req, res) => {
    try {
        const Userdata = await Users.find();
        if (!Userdata) {
            res.status(400).json({ mesaage: "User not found " });
            return;
        }
        res
            .status(200)
            .json({ data: Userdata, mesaage: "Get user details Succesfull" });
    } catch (error) {
        res.status(400).json({ data: error, mesaage: "Error" });
    }
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await Users.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorHander(`User does not exist with Id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    await Users.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

exports.adminAllUser = catchAsyncErrors(async (req, res, next) => {
    const users = await Users.find()

    res.status(200).json({
        success: true,
        users,
    })
})

//deleteUser
exports.deleteUser = catchAsyncErrors(async (req, res) => {
    try {
        const Userdata = await Users.findById(req.params.id);

        if (!Userdata) {
            res.status(400).json({ data: err, mesaage: "User Not Found" });
        }
        Users.findByIdAndDelete(req.params.id, { new: true }, (err, data) => {
            if (err) {
                throw err;
            }
            res
                .status(200)
                .json({ data: data, mesaage: "Delete User Details Successfull" });
        });
    } catch (err) {
        res.status(400).json({ data: err, mesaage: "Error in delete user" });
    }
});