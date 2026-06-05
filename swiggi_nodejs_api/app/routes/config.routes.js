const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller.js');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware.js')

router.put('/:id', authenticateToken, requireAdmin, configController.update);
router.get('/:id', configController.show);
router.get('/', configController.index);


module.exports = router;