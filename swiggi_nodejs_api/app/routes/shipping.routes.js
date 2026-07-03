const express = require("express");
const shippingController = require("../controllers/shipping.controller");

const router = express.Router();

router.get("/areas", shippingController.areas);
router.get("/districts", shippingController.districts);
router.get("/wards/:districtId", shippingController.wards);
router.post("/calculate", shippingController.calculate);

module.exports = router;
