const Planes = require("../models/orderModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

//Create Planes in database
exports.createPlanes = catchAsyncErrors(async (req, res) => {
  console.log(req.body);
  try {
    const { title } = req.body;
    const name = await Planes.findOne({ title: title });
    if (name) {
      res.status(400).json({ mesaage: "Planes Already exist" });
    }
    const user = await Planes(req.body);
    await user.save();
    res.status(200).json({ data: user, mesaage: "Planes signup Succesfull" });
  } catch (err) {
    res.status(400).json({ data: err, mesaage: "Error" });
  }
});

//get Planes in database
exports.getPlanes = catchAsyncErrors(async (req, res) => {
  try {
    const { id } = req.params.id;
    const Planedata = await Planes.findOne({ id: id });
    if (!Planedata) {
      res.status(400).json({ mesaage: "Planes not found " });
      return;
    }
    res
      .status(200)
      .json({ data: Planedata, mesaage: "Get Planes details Succesfull" });
  } catch (error) {
    res.status(400).json({ data: error, mesaage: "Error" });
  }
});

// update Planes
exports.updatePlanes = catchAsyncErrors(async (req, res) => {
  try {
    const PlaneName = await Planes.findById(req.params.id);
    console.log(PlaneName);

    if (!PlaneName) {
      res.status(400).json({ mesaage: "Planes not found " });
      return;
    } else {
      const Plane = await Planes.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      console.log(Plane);

      res
        .status(200)
        .json({ data: Plane, mesaage: "Update Planes details Succesfull" });
    }
  } catch (err) {
    res.status(400).json({ data: err, mesaage: "Update Error" });
  }
});

// getAll Plumbers
exports.getAllPlanes = catchAsyncErrors(async (req, res) => {
  try {
    const Planedata = await Planes.find();
    if (!Planedata) {
      res.status(400).json({ mesaage: "Planes not found " });
      return;
    }
    res
      .status(200)
      .json({ data: Planedata, mesaage: "Get Planes details Succesfull" });
  } catch (error) {
    res.status(400).json({ data: error, mesaage: "Error" });
  }
});

//deletePlanes
exports.deletePlanes = catchAsyncErrors(async (req, res) => {
  try {
    const Planedata = await Planes.findById(req.params.id);

    if (!Planedata) {
      res.status(400).json({ mesaage: "Planes Not Found" });
    }
    Planes.findByIdAndDelete(req.params.id, { new: true }, (err, data) => {
      if (err) {
        throw err;
      }
      res
        .status(200)
        .json({ data: data, mesaage: "Delete Planes Details Successfull" });
    });
  } catch (err) {
    res.status(400).json({ data: err, mesaage: "Error in delete Planes" });
  }
});
