const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { ensureAuthenticated } = require('../utils/auth');

router.get('/blogs', blogController.getBlogs);
router.get('/blogs/:id', blogController.getBlog);

router.post('/blogs', ensureAuthenticated, blogController.createBlog);
router.put('/blogs/:id', ensureAuthenticated, blogController.editBlog);
router.delete('/blogs/:id', ensureAuthenticated, blogController.deleteBlog);

module.exports = router;
