const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh_token', authController.refreshToken);

module.exports = router;