const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller.js');
const { authenticateToken, requireCustomer } = require('../middlewares/auth.middleware.js')

router.delete('/:id', authenticateToken, requireCustomer, cartController.delete);
router.put('/:id', authenticateToken, requireCustomer, cartController.update);
router.post('/', authenticateToken, requireCustomer, cartController.create);
router.get('/', authenticateToken, requireCustomer, cartController.index);


module.exports = router;