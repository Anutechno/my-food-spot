const ErrorHandler = require("../Utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies || req.header("Authorization").replace('Bearer', '');
    console.log("cookies = ", token);
    if (!token) {
        var response = {
            status: 401,
            message: "admin is un-authorised !",
        };
        return res.status(401).send(response);
    }
    else {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decodedData.id);

        next();
    }
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role: ${req.user.role} is not allowed to access this resouce `,
                    403
                )
            );
        }

        next();
    };
};

exports.customeRole = (...roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            return next(new ErrorHandler("not allow"))
        }
        next()
    }
}