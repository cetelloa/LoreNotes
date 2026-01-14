const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: null
    },
    verificationCodeExpires: {
        type: Date,
        default: null
    },
    // Shopping cart
    cart: [{
        templateId: { type: String, required: true },
        title: String,
        price: Number,
        addedAt: { type: Date, default: Date.now }
    }],
    // Purchased templates
    purchasedTemplates: [{
        templateId: { type: String, required: true },
        title: String,
        price: Number,
        purchaseDate: { type: Date, default: Date.now }
    }],
    // Password reset
    resetPasswordCode: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    // Email notification preferences
    emailNotifications: {
        type: Boolean,
        default: true
    },
    // Profile information
    avatarUrl: {
        type: String,
        default: null
    },
    fullName: {
        type: String,
        default: null,
        trim: true
    },
    bio: {
        type: String,
        default: null,
        maxlength: 200
    },
    country: {
        type: String,
        default: null
    },
    // Social links
    socialLinks: {
        instagram: { type: String, default: null },
        tiktok: { type: String, default: null },
        portfolio: { type: String, default: null }
    },
    // Favorite categories
    favoriteCategories: [{
        type: String
    }],
    // Favorite templates (wishlist)
    favorites: [{
        templateId: { type: String, required: true },
        title: String,
        addedAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving (Mongoose 9.x compatible - no next())
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate verification code
userSchema.methods.generateVerificationCode = function () {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    this.verificationCode = code;
    this.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    return code;
};

// Generate password reset code
userSchema.methods.generateResetCode = function () {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    this.resetPasswordCode = code;
    this.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    return code;
};

module.exports = mongoose.model('User', userSchema);
