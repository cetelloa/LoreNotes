const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-code', authController.resendCode);

// User routes
router.get('/me', adminController.getMe);

// Admin routes
router.post('/make-admin', adminController.makeAdmin);

module.exports = router;
