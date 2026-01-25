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

// ========== SPECIFIC ROUTES FIRST ==========
// Upload image endpoint (admin only) - MUST be before /:id routes
router.post('/upload-image', blogController.verifyAdmin, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'La imagen es muy grande (máximo 5MB)' });
            }
            return res.status(400).json({ message: err.message || 'Error al procesar imagen' });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No se subió ninguna imagen' });
            }

            // Convert to base64 data URL
            const base64 = req.file.buffer.toString('base64');
            const imageUrl = `data:${req.file.mimetype};base64,${base64}`;

            console.log('Image uploaded successfully, size:', req.file.size);
            res.json({ imageUrl });
        } catch (error) {
            console.error('Upload processing error:', error);
            res.status(500).json({ message: 'Error al subir imagen', error: error.message });
        }
    });
});

// Public routes
router.get('/', blogController.getAllPosts);

// Admin routes (specific paths)
router.post('/', blogController.verifyAdmin, blogController.createPost);

// ========== PARAMETERIZED ROUTES LAST ==========
// Comment routes
router.post('/:id/comments', blogController.addComment);
router.post('/:postId/comments/:commentId/reply', blogController.verifyAdmin, blogController.addReply);

// Single post routes (must be last because /:id catches everything)
router.get('/:id', blogController.getPost);
router.put('/:id', blogController.verifyAdmin, blogController.updatePost);
router.delete('/:id', blogController.verifyAdmin, blogController.deletePost);

module.exports = router;
