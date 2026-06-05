const express = require('express');
const router = express.Router();
const toppingController = require('../controllers/topping.controller.js');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware.js')

router.delete('/:id', authenticateToken, requireAdmin, toppingController.delete);
router.put('/:id', authenticateToken, requireAdmin, toppingController.update);
router.get('/:id', toppingController.show);
router.post('/', authenticateToken, requireAdmin, toppingController.create);
router.get('/', toppingController.index);


module.exports = router;