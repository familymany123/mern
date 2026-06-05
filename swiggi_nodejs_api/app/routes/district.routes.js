const express = require('express');
const router = express.Router();
const districtController = require('../controllers/district.controller.js');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware.js')

router.delete('/:id', authenticateToken, requireAdmin, districtController.delete);
router.put('/:id', authenticateToken, requireAdmin, districtController.update);
router.get('/:id', districtController.show);
router.post('/', authenticateToken, requireAdmin, districtController.create);
router.get('/', districtController.index);


module.exports = router;