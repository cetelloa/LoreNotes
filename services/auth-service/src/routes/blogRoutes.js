const express = require('express');
const router = express.Router();
const multer = require('multer');
const blogController = require('../controllers/blogController');

// Configure multer for memory storage (we'll convert to base64)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'), false);
        }
    }
});

// Public routes
router.get('/', blogController.getAllPosts);
router.get('/:id', blogController.getPost);

// Upload image endpoint (admin only)
router.post('/upload-image', blogController.verifyAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ninguna imagen' });
        }

        // Convert to base64 data URL
        const base64 = req.file.buffer.toString('base64');
        const imageUrl = `data:${req.file.mimetype};base64,${base64}`;

        res.json({ imageUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error al subir imagen', error: error.message });
    }
});

// Comment routes
router.post('/:id/comments', blogController.addComment);  // Any authenticated user
router.post('/:postId/comments/:commentId/reply', blogController.verifyAdmin, blogController.addReply);  // Admin only

// Admin routes
router.post('/', blogController.verifyAdmin, blogController.createPost);
router.put('/:id', blogController.verifyAdmin, blogController.updatePost);
router.delete('/:id', blogController.verifyAdmin, blogController.deletePost);

module.exports = router;

