// Admin endpoint to promote user to admin role
exports.makeAdmin = async (req, res) => {
    try {
        const { email, adminSecret } = req.body;

        // Simple secret key protection (change this in production!)
        const ADMIN_SECRET = process.env.ADMIN_SECRET || 'lorenotes_admin_secret_2024';

        if (adminSecret !== ADMIN_SECRET) {
            return res.status(403).json({ message: 'Secreto de admin inválido' });
        }

        const User = require('../models/User');
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.role = 'admin';
        await user.save();

        res.json({
            message: 'Usuario promovido a administrador',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Make admin error:', error);
        res.status(500).json({ message: 'Error al promover a admin' });
    }
};

// Get current user info (for checking role)
exports.getMe = async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_12345');
        const user = await User.findById(decoded.id).select('-password -verificationCode');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(401).json({ message: 'Token inválido' });
    }
};
