const jwt = require('jsonwebtoken');
const User = require('../models/Staff');

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token || '';

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    req.flash('error_msg', 'Please log in to use that resource');
    res.redirect('login');
  }
};

module.exports = authMiddleware;
