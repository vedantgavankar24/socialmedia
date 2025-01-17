const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { ensureAuthenticated } = require('../config/auth');
const authenticateToken = require('../middlewares/authMiddleware');
const multer = require('multer');
const Post = require('../models/Post');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });

const upload = multer({ storage });



//router.get('/trending', postController.getAllPosts);
router.get('/my-posts', postController.getUserPosts);
//router.post('/new-post', authenticateToken, postController.createPost);
router.post('/new-post', upload.single('image'), authenticateToken, postController.createPost);
//router.post('/:id/comments', authenticateToken, postController.addComment);


router.get('/posts/:postId', postController.getPostById);



//router.post('/posts/:postId/like', postController.likePost);
//router.post('/posts/:postId/comment', postController.addComment);
/////router.post('/like/:id', postController.toggleLike);

//router.post('/like/:postId', postController.toggleLike);



//router.get('/likes/:postId', postController.getLikes);


router.get('/posts/like/:postId/:userId', postController.likePost);
//   async (req, res) => {
//   const { postId, userId } = req.params;
//   try {
//       const post = await Post.findById( postId );
//       if (!post) {
//         return res.status(404).json({ success: false, message: 'Post not found' });
//       }
//       else {
//         const user = await User.findById( userId );
//         if (!user) {
//           return res.status(404).json({ success: false, message: 'User not found' });
//         } 
//         else {
//           const existingLike = await Like.findOne({ postId }, { userId });
//           if(!existingLike) {
//             const newLike = new Like({
//               postId,
//               userId,
//               timestamp: new Date()
//             });
      
//             await newLike.save();
//             post.likesCount += 1;
//             await post.save();
//             res.json({ success: true, likesCount: post.likesCount });
//           } else {
//             await existingLike.deleteOne();

//             post.likesCount = Math.max(post.likesCount - 1, 0); 
//             await post.save();
//             res.json({ success: true, likesCount: post.likesCount });
//           } 
//         }
//       } 
//     }
//     catch (error) {
//     console.error('Error liking/unliking post:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });
// Unlike a post
//router.post('/posts/unlike/:postId/:userId', postController.unlikePost);
// Route to like a post
// router.post('/:id/like', async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) {
//       return res.status(404).json({ message: 'Post not found' });
//     }
//     post.likes += 1;
//     await post.save();
//     res.status(200).json({ likes: post.likes });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// Route to add a comment
router.post('/:id/comment', async (req, res) => {
  const { content } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.comments.push({ content, author: req.user._id });
    await post.save();
    res.status(200).json(post.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// router.get('/post/:id', async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id).populate('author').exec();
//     res.json(post);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.get('/users/:username/posts', postController.getUserPosts);

router.get('/all/:userId', authenticateToken, postController.getAllPosts);

module.exports = router;
