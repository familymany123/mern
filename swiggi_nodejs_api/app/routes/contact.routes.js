const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller.js');
const { authenticateToken, requireAdmin, requireCustomer } = require('../middlewares/auth.middleware.js')

router.get('/:id', contactController.show);
router.post('/', authenticateToken, requireCustomer, contactController.create);
router.get('/', authenticateToken, requireAdmin, contactController.index);


module.exports = router;