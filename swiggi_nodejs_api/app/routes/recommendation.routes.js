const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendation.controller");
const {
  authenticateToken,
  requireAdmin,
  requireCustomer,
} = require("../middlewares/auth.middleware");

router.post("/", authenticateToken, requireCustomer, recommendationController.index);
router.post("/train", authenticateToken, requireAdmin, recommendationController.train);

module.exports = router;
