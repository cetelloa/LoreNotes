const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// ========== PUBLIC ROUTES ==========
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-code', authController.resendCode);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// ========== PROTECTED ROUTES (require auth) ==========
router.get('/me', adminController.getMe);

// Profile management
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/password', authMiddleware, authController.changePassword);

// Cart management
router.get('/cart', authMiddleware, authController.getCart);
router.post('/cart', authMiddleware, authController.addToCart);
router.delete('/cart/:templateId', authMiddleware, authController.removeFromCart);

// Checkout & Purchases
router.post('/checkout', authMiddleware, authController.checkout);
router.get('/purchases', authMiddleware, authController.getPurchases);

// ========== ADMIN ROUTES ==========
router.post('/make-admin', adminController.makeAdmin);

module.exports = router;
