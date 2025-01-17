const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/confirmation/:token', authController.verifyEmail);

router.get('/login', (req, res) => {
  res.render('login');
});
router.post('/login', authController.login);

router.get('/register', (req, res) => {
  res.render('register');
});
router.post('/register', authController.register);

router.get('/dashboard', authController.dashboard);
// Logout Handle
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('token');
      req.flash('success_msg', 'You are logged out');
      res.redirect('/login');
    });
  });
});

// Route to render the forgot password form
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password');
});


// Route to handle password reset request
router.post('/forgot-password', authController.resetPasswordRequest);

// Route to render the password reset form
router.get('/reset-password/:token', authController.showResetPasswordForm);

// Route to handle password reset form submission
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
