const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller.js');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware.js')

router.delete('/:id', authenticateToken, requireAdmin, bannerController.delete);
router.put('/:id', authenticateToken, requireAdmin, bannerController.update);
router.get('/:id', bannerController.show);
router.post('/', authenticateToken, requireAdmin, bannerController.create);
router.get('/', bannerController.index);


module.exports = router;