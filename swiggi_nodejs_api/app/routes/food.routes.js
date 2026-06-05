const express = require('express');
const router = express.Router();
const foodController = require('../controllers/food.controller.js');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware.js')

router.delete('/:id', authenticateToken, requireAdmin, foodController.delete);
router.put('/:id', authenticateToken, requireAdmin, foodController.update);
router.get('/:id', foodController.show);
router.post('/', authenticateToken, requireAdmin, foodController.create);
router.get('/', foodController.index);


module.exports = router;