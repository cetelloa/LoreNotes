const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../services/emailService');
const paypalService = require('../services/paypalService');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret_key_12345',
        { expiresIn: '1d' }
    );
};

// Register - Step 1: Create user and send verification code
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        let existingUser = await User.findOne({ email });

        if (existingUser) {
            // If user exists but is NOT verified, resend verification code
            if (!existingUser.isVerified) {
                // Update password in case they want to use a new one
                existingUser.password = password;
                existingUser.username = username;

                // Generate new verification code
                const verificationCode = existingUser.generateVerificationCode();
                await existingUser.save();

                // Resend verification email
                await sendVerificationEmail(email, verificationCode, username);

                return res.status(200).json({
                    message: 'Código de verificación reenviado. Revisa tu email.',
                    requiresVerification: true,
                    email: email
                });
            }

            // User exists AND is verified - cannot register again
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            isVerified: false
        });

        // Generate verification code
        const verificationCode = user.generateVerificationCode();
        await user.save();

        // Send verification email
        await sendVerificationEmail(email, verificationCode, username);

        res.status(201).json({
            message: 'Usuario creado. Revisa tu email para el código de verificación.',
            requiresVerification: true,
            email: email
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Error en el servidor durante el registro' });
    }
};

// Verify email - Step 2: Verify code and complete registration
exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'El email ya está verificado' });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ message: 'Código incorrecto' });
        }

        if (user.verificationCodeExpires < new Date()) {
            return res.status(400).json({ message: 'El código ha expirado. Solicita uno nuevo.' });
        }

        // Mark as verified
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        // Generate token and log them in
        const token = generateToken(user);

        res.json({
            message: '¡Email verificado correctamente!',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ message: 'Error en el servidor durante la verificación' });
    }
};

// Resend verification code
exports.resendCode = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'El email ya está verificado' });
        }

        const verificationCode = user.generateVerificationCode();
        await user.save();

        await sendVerificationEmail(email, verificationCode, user.username);

        res.json({ message: 'Código reenviado. Revisa tu email.' });

    } catch (error) {
        console.error('Resend error:', error);
        res.status(500).json({ message: 'Error al reenviar código' });
    }
};

// Login - Check verification status
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Check if verified
        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Email no verificado',
                requiresVerification: true,
                email: email
            });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error en el servidor durante el login' });
    }
};

// ========== PROFILE MANAGEMENT ==========

// Update profile (all fields)
exports.updateProfile = async (req, res) => {
    try {
        const {
            username, email, fullName, bio, country,
            avatarUrl, socialLinks, favoriteCategories
        } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Check if username is taken by another user
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'El nombre de usuario ya existe' });
            }
            user.username = username;
        }

        // Check if email is taken by another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'El email ya está en uso' });
            }
            user.email = email;
        }

        // Update profile fields
        if (fullName !== undefined) user.fullName = fullName;
        if (bio !== undefined) user.bio = bio;
        if (country !== undefined) user.country = country;
        if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
        if (favoriteCategories !== undefined) user.favoriteCategories = favoriteCategories;

        // Update social links
        if (socialLinks) {
            user.socialLinks = {
                instagram: socialLinks.instagram || user.socialLinks?.instagram || null,
                tiktok: socialLinks.tiktok || user.socialLinks?.tiktok || null,
                portfolio: socialLinks.portfolio || user.socialLinks?.portfolio || null
            };
        }

        await user.save();

        res.json({
            message: 'Perfil actualizado',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                bio: user.bio,
                country: user.country,
                avatarUrl: user.avatarUrl,
                socialLinks: user.socialLinks,
                favoriteCategories: user.favoriteCategories
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error al actualizar perfil' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Se requieren ambas contraseñas' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña actual incorrecta' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Error al cambiar contraseña' });
    }
};

// ========== CART MANAGEMENT ==========

// Get cart
exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ cart: user.cart || [] });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Error al obtener carrito' });
    }
};

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        const { templateId, title, price } = req.body;
        const user = await User.findById(req.user.id);

        // Check if already in cart
        const existsInCart = user.cart.some(item => item.templateId === templateId);
        if (existsInCart) {
            return res.status(400).json({ message: 'La plantilla ya está en el carrito' });
        }

        // Check if already purchased
        const alreadyPurchased = user.purchasedTemplates.some(item => item.templateId === templateId);
        if (alreadyPurchased) {
            return res.status(400).json({ message: 'Ya has comprado esta plantilla' });
        }

        user.cart.push({ templateId, title, price });
        await user.save();

        res.json({ message: 'Agregado al carrito', cart: user.cart });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Error al agregar al carrito' });
    }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { templateId } = req.params;
        const user = await User.findById(req.user.id);

        user.cart = user.cart.filter(item => item.templateId !== templateId);
        await user.save();

        res.json({ message: 'Eliminado del carrito', cart: user.cart });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Error al eliminar del carrito' });
    }
};

// Checkout - Move cart items to purchased
exports.checkout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        // Calculate total
        const total = user.cart.reduce((sum, item) => sum + (item.price || 0), 0);

        // Move cart items to purchased
        const purchaseDate = new Date();
        for (const item of user.cart) {
            user.purchasedTemplates.push({
                templateId: item.templateId,
                title: item.title,
                price: item.price,
                purchaseDate
            });
        }

        // Clear cart
        user.cart = [];
        await user.save();

        res.json({
            message: '¡Compra realizada con éxito!',
            total,
            purchasedCount: user.purchasedTemplates.length
        });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ message: 'Error al procesar la compra' });
    }
};

// Get purchases
exports.getPurchases = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ purchases: user.purchasedTemplates || [] });
    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({ message: 'Error al obtener compras' });
    }
};

// ========== FAVORITES (WISHLIST) ==========

// Get favorites
exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ favorites: user.favorites || [] });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ message: 'Error al obtener favoritos' });
    }
};

// Add to favorites
exports.addFavorite = async (req, res) => {
    try {
        const { templateId, title } = req.body;
        const user = await User.findById(req.user.id);

        // Check if already in favorites
        if (user.favorites.some(f => f.templateId === templateId)) {
            return res.status(400).json({ message: 'Ya está en favoritos' });
        }

        user.favorites.push({ templateId, title });
        await user.save();

        res.json({
            message: 'Agregado a favoritos',
            favorites: user.favorites
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ message: 'Error al agregar a favoritos' });
    }
};

// Remove from favorites
exports.removeFavorite = async (req, res) => {
    try {
        const { templateId } = req.params;
        const user = await User.findById(req.user.id);

        user.favorites = user.favorites.filter(f => f.templateId !== templateId);
        await user.save();

        res.json({
            message: 'Eliminado de favoritos',
            favorites: user.favorites
        });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ message: 'Error al eliminar de favoritos' });
    }
};

// ========== PAYPAL PAYMENTS ==========

// Create PayPal order
exports.createPayPalOrder = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        // Check if PayPal is configured
        if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
            return res.status(500).json({ message: 'PayPal no está configurado' });
        }

        const order = await paypalService.createOrder(user.cart, user._id.toString());

        res.json({
            orderId: order.id,
            status: order.status,
            total: order.total
        });

    } catch (error) {
        console.error('Create PayPal order error:', error);
        res.status(500).json({ message: error.message || 'Error al crear orden de PayPal' });
    }
};

// Capture PayPal payment
exports.capturePayPalOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID requerido' });
        }

        // Capture the payment
        const capture = await paypalService.capturePayment(orderId);

        if (capture.status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Pago no completado', status: capture.status });
        }

        // Payment successful - move cart to purchased
        const user = await User.findById(req.user.id);
        const purchaseDate = new Date();
        const total = user.cart.reduce((sum, item) => sum + (item.price || 0), 0);

        for (const item of user.cart) {
            user.purchasedTemplates.push({
                templateId: item.templateId,
                title: item.title,
                price: item.price,
                purchaseDate,
                paypalOrderId: orderId
            });
        }

        // Clear cart
        user.cart = [];
        await user.save();

        res.json({
            message: '¡Pago exitoso! Gracias por tu compra.',
            paypalOrderId: orderId,
            total,
            purchasedCount: user.purchasedTemplates.length,
            payerEmail: capture.payer?.email
        });

    } catch (error) {
        console.error('Capture PayPal order error:', error);
        res.status(500).json({ message: error.message || 'Error al procesar el pago' });
    }
};

// Forgot password - Send reset code
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'No existe una cuenta con ese email' });
        }

        // Generate reset code
        const resetCode = user.generateResetCode();
        await user.save();

        // Send reset email
        const { sendPasswordResetEmail } = require('../services/emailService');
        await sendPasswordResetEmail(email, resetCode, user.username);

        res.json({ message: 'Código de recuperación enviado a tu email', email });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error al procesar solicitud' });
    }
};

// Reset password - Verify code and set new password
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.resetPasswordCode !== code) {
            return res.status(400).json({ message: 'Código incorrecto' });
        }

        if (user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ message: 'El código ha expirado. Solicita uno nuevo.' });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordCode = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error al restablecer contraseña' });
    }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
    try {
        const { emailNotifications } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.emailNotifications = emailNotifications;
        await user.save();

        res.json({
            message: 'Preferencias actualizadas',
            emailNotifications: user.emailNotifications
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ message: 'Error al actualizar preferencias' });
    }
};

// Get subscribed users for blog notifications (admin only)
exports.getSubscribedUsers = async (req, res) => {
    try {
        const users = await User.find({
            isVerified: true,
            emailNotifications: true
        }).select('email username');

        res.json({ users });
    } catch (error) {
        console.error('Get subscribed users error:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};
