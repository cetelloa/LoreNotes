const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountPercent: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    maxUses: {
        type: Number,
        default: null // null = unlimited
    },
    currentUses: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        default: null // null = never expires
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Check if coupon is valid
couponSchema.methods.isValid = function () {
    if (!this.isActive) return false;
    if (this.expiresAt && new Date() > this.expiresAt) return false;
    if (this.maxUses && this.currentUses >= this.maxUses) return false;
    return true;
};

module.exports = mongoose.model('Coupon', couponSchema);
