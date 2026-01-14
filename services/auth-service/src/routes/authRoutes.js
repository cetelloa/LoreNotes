const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const couponController = require('../controllers/couponController');
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
router.post('/claim-free', authMiddleware, authController.claimFreeTemplate);
router.get('/purchases', authMiddleware, authController.getPurchases);

// PayPal Payments
router.post('/paypal/create-order', authMiddleware, authController.createPayPalOrder);
router.post('/paypal/capture-order', authMiddleware, authController.capturePayPalOrder);

// Notification Preferences
router.put('/notifications', authMiddleware, authController.updateNotificationPreferences);
router.get('/subscribed-users', authMiddleware, authController.getSubscribedUsers);

// Favorites (Wishlist)
router.get('/favorites', authMiddleware, authController.getFavorites);
router.post('/favorites', authMiddleware, authController.addFavorite);
router.delete('/favorites/:templateId', authMiddleware, authController.removeFavorite);

// Coupons (user endpoints)
router.post('/coupons/validate', authMiddleware, couponController.validateCoupon);
router.post('/coupons/apply', authMiddleware, couponController.applyCoupon);

// ========== ADMIN ROUTES ==========
router.post('/make-admin', adminController.makeAdmin);
router.get('/admin/sales', authMiddleware, adminController.getSales);

// Admin coupon management
router.get('/admin/coupons', authMiddleware, couponController.getCoupons);
router.post('/admin/coupons', authMiddleware, couponController.createCoupon);
router.delete('/admin/coupons/:id', authMiddleware, couponController.deleteCoupon);
router.patch('/admin/coupons/:id/toggle', authMiddleware, couponController.toggleCoupon);

// Categories (public get, protected create/delete)
const categoryController = require('../controllers/categoryController');
router.get('/categories', categoryController.getCategories);
router.post('/categories', authMiddleware, categoryController.createCategory);
router.delete('/categories/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;
