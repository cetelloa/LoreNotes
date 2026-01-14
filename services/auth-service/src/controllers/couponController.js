const Coupon = require('../models/Coupon');

// Get all coupons (admin only)
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        console.error('Get coupons error:', error);
        res.status(500).json({ message: 'Error al obtener cupones' });
    }
};

// Create coupon (admin only)
exports.createCoupon = async (req, res) => {
    try {
        const { code, discountPercent, maxUses, expiresAt } = req.body;

        if (!code || !discountPercent) {
            return res.status(400).json({ message: 'Código y porcentaje de descuento son requeridos' });
        }

        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Este código ya existe' });
        }

        const coupon = new Coupon({
            code: code.toUpperCase(),
            discountPercent,
            maxUses: maxUses || null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            createdBy: req.user.id
        });

        await coupon.save();
        res.status(201).json(coupon);
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({ message: 'Error al crear cupón' });
    }
};

// Delete coupon (admin only)
exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Cupón eliminado' });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ message: 'Error al eliminar cupón' });
    }
};

// Toggle coupon active status (admin only)
exports.toggleCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Cupón no encontrado' });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json(coupon);
    } catch (error) {
        console.error('Toggle coupon error:', error);
        res.status(500).json({ message: 'Error al actualizar cupón' });
    }
};

// Validate coupon (any authenticated user)
exports.validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Código requerido' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ valid: false, message: 'Cupón no encontrado' });
        }

        if (!coupon.isValid()) {
            return res.status(400).json({ valid: false, message: 'Cupón expirado o agotado' });
        }

        res.json({
            valid: true,
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            message: `¡${coupon.discountPercent}% de descuento aplicado!`
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({ message: 'Error al validar cupón' });
    }
};

// Apply coupon (increment usage counter)
exports.applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon || !coupon.isValid()) {
            return res.status(400).json({ message: 'Cupón inválido' });
        }

        coupon.currentUses += 1;
        await coupon.save();

        res.json({ success: true, discountPercent: coupon.discountPercent });
    } catch (error) {
        console.error('Apply coupon error:', error);
        res.status(500).json({ message: 'Error al aplicar cupón' });
    }
};
