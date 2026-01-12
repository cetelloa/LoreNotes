const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Public routes
router.get('/', blogController.getAllPosts);
router.get('/:id', blogController.getPost);

// Comment routes
router.post('/:id/comments', blogController.addComment);  // Any authenticated user
router.post('/:postId/comments/:commentId/reply', blogController.verifyAdmin, blogController.addReply);  // Admin only

// Admin routes
router.post('/', blogController.verifyAdmin, blogController.createPost);
router.put('/:id', blogController.verifyAdmin, blogController.updatePost);
router.delete('/:id', blogController.verifyAdmin, blogController.deletePost);

module.exports = router;

