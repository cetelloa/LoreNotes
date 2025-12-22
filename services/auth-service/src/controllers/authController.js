const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../services/emailService');

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

// Update profile (username, email)
exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
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

        await user.save();

        res.json({
            message: 'Perfil actualizado',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
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
