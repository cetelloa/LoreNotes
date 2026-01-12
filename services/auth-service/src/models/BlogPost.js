const mongoose = require('mongoose');

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
    }
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
