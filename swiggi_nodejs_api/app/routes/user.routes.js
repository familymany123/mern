const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller.js');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware.js')

router.patch('/:id/block', authenticateToken, requireAdmin, userController.block);
router.put('/', authenticateToken, userController.update);
router.get('/profile', authenticateToken, userController.profile);
router.get('/:id', authenticateToken, requireAdmin, userController.show);
router.get('/', authenticateToken, requireAdmin, userController.index);


module.exports = router;