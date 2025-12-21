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
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

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
