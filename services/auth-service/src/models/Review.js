const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    templateId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 500,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound unique index - one review per user per template
reviewSchema.index({ templateId: 1, userId: 1 }, { unique: true });

// Index for sorting by date
reviewSchema.index({ templateId: 1, createdAt: -1 });

// Update the updatedAt field on save
reviewSchema.pre('save', function () {
    if (!this.isNew) {
        this.updatedAt = new Date();
    }
});

module.exports = mongoose.model('Review', reviewSchema);
