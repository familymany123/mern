const express = require("express");
const shippingController = require("../controllers/shipping.controller");

const router = express.Router();

router.get("/areas", shippingController.areas);
router.post("/calculate", shippingController.calculate);

module.exports = router;
