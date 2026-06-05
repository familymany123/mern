const express = require('express');
const router = express.Router();
const provinceController = require('../controllers/province.controller.js');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware.js')

router.delete('/:id', authenticateToken, requireAdmin, provinceController.delete);
router.put('/:id', authenticateToken, requireAdmin, provinceController.update);
router.get('/:id', provinceController.show);
router.post('/', authenticateToken, requireAdmin, provinceController.create);
router.get('/', provinceController.index);


module.exports = router;