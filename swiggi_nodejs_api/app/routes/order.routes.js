const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller.js');
const { authenticateToken, requireAdmin, requireCustomer } = require('../middlewares/auth.middleware.js')

router.patch('/:id/cancel', authenticateToken, orderController.cancel);
router.patch('/:id/expire-payment', authenticateToken, orderController.expirePayment);
router.patch('/:id/status', authenticateToken, requireAdmin, orderController.status);
router.patch('/:id/delivered', authenticateToken, orderController.delivered);
router.post('/momo/ipn', orderController.momoIpn);
router.get('/:id', authenticateToken, orderController.show);
router.post('/', authenticateToken, requireCustomer, orderController.create);
router.get('/', authenticateToken, orderController.index);


module.exports = router;
