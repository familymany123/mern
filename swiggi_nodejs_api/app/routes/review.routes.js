const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller.js');
const { authenticateToken } = require('../middlewares/auth.middleware.js')

router.post('/', authenticateToken, reviewController.create);
router.get('/:id/food', reviewController.index);


module.exports = router;