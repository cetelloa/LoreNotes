const BlogPost = require('../models/BlogPost');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No autorizado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crafthub-secret-key');
        const user = await User.findById(decoded.userId);

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
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crafthub-secret-key');
                const user = await User.findById(decoded.userId);
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

// Create post (admin only)
const createPost = async (req, res) => {
    try {
        const { title, content, author, isPublished, tags, imageUrl } = req.body;

        const post = new BlogPost({
            title,
            content,
            author: author || req.user.username,
            isPublished: isPublished || false,
            tags: tags || [],
            imageUrl
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear post', error: error.message });
    }
};

// Update post (admin only)
const updatePost = async (req, res) => {
    try {
        const { title, content, isPublished, tags, imageUrl } = req.body;

        const post = await BlogPost.findByIdAndUpdate(
            req.params.id,
            { title, content, isPublished, tags, imageUrl },
            { new: true }
        );

        if (!post) return res.status(404).json({ message: 'Post no encontrado' });
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
