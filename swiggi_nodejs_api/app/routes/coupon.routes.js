const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller.js');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware.js')

router.delete('/:id', authenticateToken, requireAdmin, couponController.delete);
router.put('/:id', authenticateToken, requireAdmin, couponController.update);
router.get('/:id', couponController.show);
router.post('/', authenticateToken, requireAdmin, couponController.create);
router.get('/', couponController.index);


module.exports = router;