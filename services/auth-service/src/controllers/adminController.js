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
            isVerified: user.isVerified,
            emailNotifications: user.emailNotifications ?? true,
            avatarUrl: user.avatarUrl,
            fullName: user.fullName,
            bio: user.bio,
            country: user.country,
            socialLinks: user.socialLinks || {},
            favoriteCategories: user.favoriteCategories || [],
            createdAt: user.createdAt,
            purchasedCount: user.purchasedTemplates?.length || 0
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(401).json({ message: 'Token inválido' });
    }
};

// Get all sales (admin only)
exports.getSales = async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');

        // Verify admin
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No autorizado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_12345');
        const admin = await User.findById(decoded.id);

        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        // Get all users with purchases
        const users = await User.find({
            'purchasedTemplates.0': { $exists: true }
        }).select('username email purchasedTemplates');

        // Flatten all purchases into a single array
        const allSales = [];
        for (const user of users) {
            for (const purchase of user.purchasedTemplates) {
                allSales.push({
                    id: purchase._id,
                    buyer: {
                        username: user.username,
                        email: user.email
                    },
                    templateId: purchase.templateId,
                    title: purchase.title,
                    price: purchase.price,
                    purchaseDate: purchase.purchaseDate,
                    paypalOrderId: purchase.paypalOrderId
                });
            }
        }

        // Sort by date (newest first)
        allSales.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

        // Calculate totals
        const totalRevenue = allSales.reduce((sum, sale) => sum + (sale.price || 0), 0);

        res.json({
            sales: allSales,
            totalSales: allSales.length,
            totalRevenue
        });

    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ message: 'Error al obtener ventas' });
    }
};
