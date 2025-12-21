const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Public routes
router.get('/', blogController.getAllPosts);
router.get('/:id', blogController.getPost);

// Admin routes
router.post('/', blogController.verifyAdmin, blogController.createPost);
router.put('/:id', blogController.verifyAdmin, blogController.updatePost);
router.delete('/:id', blogController.verifyAdmin, blogController.deletePost);

module.exports = router;
