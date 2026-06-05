const express = require('express');
const router = express.Router();
const foodToppingController = require('../controllers/foodTopping.controller.js');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware.js')

router.delete('/:id', authenticateToken, requireAdmin, foodToppingController.delete);
router.get('/:id', foodToppingController.show);
router.post('/', authenticateToken, requireAdmin, foodToppingController.create);


module.exports = router;