// var jwt = require("jsonwebtoken");

// const createToken = (email) => {
//     const token = jwt.sign({ email: email }, "secretkeyOne");
//     return token;
// };
const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();
    const options = {
        expires: new Date(
            Date.new() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 //day*hour*minute*second
        ),
        httpOnly: true,
    };
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token,
    });
};

// module.exports = { createToken, sendToken };
module.exports = sendToken;