const mongoose = require('mongoose');

// Reply schema (nested inside comments)
const replySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    avatarUrl: { type: String },
    content: { type: String, required: true, maxlength: 1000 },
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

// Comment schema
const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    avatarUrl: { type: String },
    content: { type: String, required: true, maxlength: 1000 },
    replies: [replySchema]
}, { timestamps: true });

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String
    }],
    imageUrl: {
        type: String
    },
    videoUrl: {
        type: String  // YouTube or TikTok URL
    },
    comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);

