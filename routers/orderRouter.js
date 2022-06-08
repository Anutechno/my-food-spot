const express = require("express");
const router = express.Router();

const {
  createPlanes,
  getPlanes,
  updatePlanes,
  getAllPlanes,
  deletePlanes,
} = require("../controllers/orderController");

router.route("/createorder").post(createPlanes);
router.route("/getorder").get(getPlanes);
router.route("/updateorder/update/:id").put(updatePlanes);
router.route("/allorder").get(getAllPlanes);
router.route("/order/:id").delete(deletePlanes);

module.exports = router;
