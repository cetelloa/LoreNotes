const BlogPost = require('../models/BlogPost');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendBlogNotificationEmail } = require('../services/emailService');

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No autorizado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_12345');
        const user = await User.findById(decoded.id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

// Get all blog posts (public - only published, admin - all)
const getAllPosts = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        let isAdmin = false;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_12345');
                const user = await User.findById(decoded.id);
                isAdmin = user?.role === 'admin';
            } catch { }
        }

        const filter = isAdmin ? {} : { isPublished: true };
        const posts = await BlogPost.find(filter).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener posts', error: error.message });
    }
};

// Get single post
const getPost = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post no encontrado' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener post', error: error.message });
    }
};

// Send notifications to subscribed users
const sendNotificationsToSubscribers = async (post) => {
    try {
        // Get all verified users with email notifications enabled
        const subscribedUsers = await User.find({
            isVerified: true,
            emailNotifications: true
        }).select('email username');

        console.log(`Sending blog notification to ${subscribedUsers.length} subscribers`);

        // Send emails (don't wait for all to complete)
        for (const user of subscribedUsers) {
            try {
                await sendBlogNotificationEmail(user.email, post.title, user.username);
            } catch (emailError) {
                console.error(`Failed to send email to ${user.email}:`, emailError.message);
            }
        }
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
};

// Create post (admin only)
const createPost = async (req, res) => {
    try {
        const { title, content, author, isPublished, tags, imageUrl, videoUrl } = req.body;

        const post = new BlogPost({
            title,
            content,
            author: author || req.user.username,
            isPublished: isPublished || false,
            tags: tags || [],
            imageUrl,
            videoUrl
        });

        await post.save();

        // If published, send notifications to subscribed users
        if (post.isPublished) {
            sendNotificationsToSubscribers(post);
        }

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear post', error: error.message });
    }
};

// Update post (admin only)
const updatePost = async (req, res) => {
    try {
        const { title, content, isPublished, tags, imageUrl, videoUrl } = req.body;

        // Get the current post to check if it was previously published
        const existingPost = await BlogPost.findById(req.params.id);
        const wasPublished = existingPost?.isPublished;

        const post = await BlogPost.findByIdAndUpdate(
            req.params.id,
            { title, content, isPublished, tags, imageUrl, videoUrl },
            { new: true }
        );

        if (!post) return res.status(404).json({ message: 'Post no encontrado' });

        // If just became published (wasn't before, is now), send notifications
        if (!wasPublished && isPublished) {
            sendNotificationsToSubscribers(post);
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar post', error: error.message });
    }
};

// Delete post (admin only)
const deletePost = async (req, res) => {
    try {
        const post = await BlogPost.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post no encontrado' });
        res.json({ message: 'Post eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar post', error: error.message });
    }
};

module.exports = {
    verifyAdmin,
    getAllPosts,
    getPost,
    createPost,
    updatePost,
    deletePost
};
