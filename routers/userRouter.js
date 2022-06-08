const express = require("express");
const router = express.Router();
const {
    registerUser,
    getUser,
    loginUser,
    logoutUser,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    getAllUser,
    getSingleUser,
    updateUserRole,
    forgpass,
    adminAllUser,
    deleteUser,
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles,customeRole } = require("../middleware/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/getuser").get(isAuthenticatedUser, getUser);
router.route("/profile/update/:id").put(isAuthenticatedUser, updateProfile);
router.route("password/update").put(isAuthenticatedUser, updatePassword);

router.route("/password/forgot").post(forgotPassword);
router.route("/password/forgpass").post(forgpass);
router.route("/password/reset/:token").put(resetPassword);
router.route("/admin/roll").get(customeRole("admin"),adminAllUser);

router
    .route("/admin/users")
    .get(isAuthenticatedUser, authorizeRoles("user"), getAllUser);

router
    .route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeRoles("user"), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles("user"), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRoles("user"), deleteUser);

module.exports = router;