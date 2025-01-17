const Post = require('../models/Post');
const User = require('../models/User');
const Like = require('../models/Like');
const fs = require('fs-extra');
const path = require('path');
const { formatDistanceToNow } = require('date-fns');
const authenticateToken = require('../middlewares/authMiddleware');

exports.getTrendingPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ likes: -1 }).limit(10).populate('author').populate('comments.author');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).populate('comments.author');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  if (!req.user || !req.user._id) {
    return res.status(400).json({ message: 'Author is required' });
  }

  try {
    const newPost = new Post({
      title,
      content,
      image,
      author: req.user._id,
    });

    await newPost.save();

    newPost.shareLink = `${req.protocol}://${req.get('host')}/posts/${newPost._id}`;
    await newPost.save();

    const timeElapsed = formatDistanceToNow(newPost.createdAt);

    res.render('post', {
      title: newPost.title,
      content: newPost.content,
      image: newPost.image,
      shareLink: newPost.shareLink,
      author: req.user.username,
      timeElapsed,
      likes: newPost.likes,
      comments: newPost.comments,
      createdAt: newPost.createdAt ? newPost.createdAt.toISOString().slice(0, 10) : 'Unknown'
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// exports.createPost = async (req, res) => {
//   const { title, content } = req.body;
//   const image = req.file ? `/uploads/${req.file.filename}` : '';

//   if (!req.user || !req.user._id) {
//     return res.status(400).json({ message: 'Author is required' });
//   }

//   try {
//     const newPost = new Post({
//       title,
//       content,
//       image,
//       author: req.user._id,
//     });

//     await newPost.save();

//     newPost.shareLink = `${req.protocol}://${req.get('host')}/posts/${newPost._id}`;
//     await newPost.save();

//     const timeElapsed = formatDistanceToNow(newPost.createdAt);

//     res.render('post', {
//       title: newPost.title,
//       content: newPost.content,
//       image: newPost.image,
//       shareLink: newPost.shareLink,
//       author: req.user.username,
//       timeElapsed,
//       likes: newPost.likes,
//       comments: newPost.comments,
//       createdAt: newPost.createdAt ? newPost.createdAt.toISOString().slice(0, 10) : 'Unknown'
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



exports.getPostById = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate('author').exec();
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // res.render('post', {
    //   title: post.title,
    //   content: post.content,
    //   image: post.image,
    //   shareLink: post.shareLink,
    //   author: post.author.username, // Assuming post.author contains the username
    //   createdAt: post.createdAt ? post.createdAt.toISOString().slice(0, 10) : 'Unknown'
    // });
    const timeElapsed = formatDistanceToNow(post.createdAt);

    res.render('post', {
      _id: post._id,
      title: post.title,
      content: post.content,
      image: post.image,
      shareLink: post.shareLink,
      author: post.author.username,
      timeElapsed,
      likes: post.likes,
      comments: post.comments,
      createdAt: post.createdAt ? post.createdAt.toISOString().slice(0, 10) : 'Unknown'
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// controllers/postController.js
///// exports.likePost = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.postId);
//     if (!post) {
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     post.likes += 1;
//     await post.save();
//     res.redirect(`/posts/${req.params.postId}`);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      content: req.body.content,
      author: req.user._id,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    res.redirect(`/posts/${req.params.postId}`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 }).exec();
    if (!posts) return res.status(404).send('Post(s) not found');

    console.log('user id: ',userId);

    const cuser = await User.findById(userId);
    if (!cuser) return res.status(404).send('Authentication failed, please login to continue.');
    console.log('Cuser found:', cuser);

    const formattedPosts = await Promise.all(posts.map(async (post) => {
      let isLikedByUser = await Like.findOne({ postId: post._id, userId: cuser._id });

      if(isLikedByUser) {
        isLikedByUser = cuser._id;
      } else {
        isLikedByUser = null;
      }
  
      return {
        _id: post._id,
        userId: cuser._id,
        title: post.title,
        content: post.content,
        image: post.image,
        shareLink: post.shareLink,
        author: post.author.username,
        timeElapsed: formatDistanceToNow(post.createdAt),
        likesCount: post.likesCount,
        postId: isLikedByUser,
        comments: post.comments,
        createdAt: post.createdAt ? post.createdAt.toISOString().slice(0, 10) : 'Unknown',
      };
    }));

    const currentUser = {
      _id: cuser._id,
      username: cuser.username
    };

    

    //res.render('allPosts', { posts: formattedPosts });
    res.render('allPosts', { posts: formattedPosts , currentUser: currentUser });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


exports.getUserPosts = async (req, res) => {
  const username = req.params.username;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all posts by the user
    const posts = await Post.find({ author: user._id }).populate('author', 'username').sort({ createdAt: -1 }).exec();

    // Format posts for rendering
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      title: post.title,
      content: post.content,
      image: post.image,
      shareLink: post.shareLink,
      author: post.author.username, // Ensure author.username is correctly populated
      timeElapsed: formatDistanceToNow(post.createdAt),
      likes: post.likes,
      comments: post.comments,
      createdAt: post.createdAt ? post.createdAt.toISOString().slice(0, 10) : 'Unknown'
    }));

    // Render the view with the formatted posts
    res.render('usersPosts', { posts: formattedPosts, username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.toggleLike1 = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter(like => like.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();

   // res.json({ likes: post.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.toggleLike2 = async (req, res) => {
  try {
    //const { postId } = req.params.postId;
    const { postId } = req.params;
   // const { userId } = req.params.userId;
    // Check if the user already liked the post
    //const existingLike = await Like.findOne({ post: postId });
    // if (existingLike) {
    //   await Like.deleteOne({  post: postId });
    // } else {
      const like = new Like({ post: postId });
      await like.save();
    //}
  } catch (error) {
    console.error('Error liking/unliking the post:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.likePost = async (req, res) => {
  const { postId, userId } = req.params;
  try {
      const post = await Post.findById( postId );
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      else {
        const user = await User.findById( userId );
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        } 
        else {
          const existingLike = await Like.findOne({ postId }, { userId });
          if(!existingLike) {
            const newLike = new Like({
              postId,
              userId,
              timestamp: new Date()
            });
      
            await newLike.save();
            post.likesCount += 1;
            await post.save();


          } else {
            await existingLike.deleteOne();

            post.likesCount = Math.max(post.likesCount - 1, 0); 
            await post.save();
            //res.json({ success: true, likesCount: post.likesCount });
          } 
        }
      } 
    }
    catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Unlike a post
// exports.unlikePost = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) {
//       return res.status(404).json({ success: false, message: 'Post not found' });
//     }

//     post.likesCount = Math.max(post.likesCount - 1, 0); // Ensure likesCount doesn't go below 0
//     await post.save();

//     res.json({ success: true, likesCount: post.likesCount });
//   } catch (error) {
//     console.error('Error unliking post:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// Get likes for a post
exports.getLikes = async (req, res) => {
  try {
    const postId = req.params.id;
    const likes = await Like.find({ post: postId }).populate('user', 'username');
    res.json({ success: true, likes });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};