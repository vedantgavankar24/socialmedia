const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/email');
const { sendPasswordResetEmail } = require('../utils/email');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const {username, email, password } = req.body;
  try {
    const existingUsernorem = await User.findOne({ $or: [{ username }, { email }] });
    if(existingUsernorem) {
      const existingUser = await User.findOne({ username , email });

      if(existingUser) {
        if (existingUser.isVerified) {
          res.render('alreadyExists');
        } else {
          existingUser.verificationToken = crypto.randomBytes(20).toString('hex');
          existingUser.verificationTokenExpires = Date.now() + 3600000; // 1 hour
          await existingUser.save();
          await sendVerificationEmail(existingUser.email, existingUser.verificationToken);
          res.render('alreadyRegistered');
        }
      } else {
        const existingUser1 = await User.findOne({ username });
        const existingUser2 = await User.findOne({ email });
        if(existingUser1) {
          res.render('unExists');
        } else if(existingUser2) {
          res.render('eExists');
        }
        
      } 
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const token = crypto.randomBytes(32).toString('hex');

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        verificationToken: token,
        verificationTokenExpires: Date.now() + 24 * 3600 * 1000, // 24 hours
      });

      await newUser.save();
      await sendVerificationEmail(email, token);

      //req.flash('success_msg', 'User registered. Please check your email to verify your account.');
      res.render('registrationSuccess');
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token, verificationTokenExpires: { $gt: Date.now() } });
    if (!user) {
      return res.render('login', { error: 'Token is invalid or has expired. Please try signing up again.' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    res.render('verified');
  } catch (err) {
      console.error(error);
      res.render('login', { error: 'An error occurred. Please try again.' });
  }
};

exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
  });

  if (!user) {
    return res.render('login', { error: 'Invalid username/email or password' });
  } else {
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.render('login', { error: 'Invalid username/email or password' });
    } else {
      if (!user.isVerified) {
        user.verificationToken = crypto.randomBytes(20).toString('hex');
        user.verificationTokenExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        await sendVerificationEmail(user.email, user.verificationToken);
        res.render('alreadyRegistered');
      } else {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        console.log('User found:', user);
        res.render('dashboard', {
          _id: user._id,
          username: user.username
        });
    }
    }
  }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPasswordRequest = async (req, res) => {
  const { identifier } = req.body;

  try {
      // Find user by username or email
      const user = await User.findOne({
          $or: [{ username: identifier }, { email: identifier }]
      });

      if (!user) {
        res.render('userdnexist');
      } else {

        if (!user.isVerified) {
          user.verificationToken = crypto.randomBytes(20).toString('hex');
          user.verificationTokenExpires = Date.now() + 3600000; // 1 hour
          await user.save();
          await sendVerificationEmail(user.email, user.verificationToken);
          res.render('alreadyRegistered');
        } else {

          user.resetToken = crypto.randomBytes(20).toString('hex');;
          user.resetTokenExpires = Date.now() + 3600000; // 1 hour
          await user.save();
          await sendPasswordResetEmail(user.email, user.username, user.resetToken);
          res.render('passresetmailsent');
        }

      }
  } catch (err) {
      console.error('Password reset error:', err);
      res.status(500).json({ error: err.message });
      //return res.status(500).json({ error: 'Internal server error' });
    
  }
};

exports.showResetPasswordForm = async (req, res) => {
  const { token } = req.params;

  try {
      // Validate token and ensure it's not expired
      const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });

      if (!user) {
          res.render('passlinkexpired');
      } else {
        // Render the password reset form with token
        res.render('reset-password', { token });
      }

  } catch (error) {
      console.error('Error rendering password reset form:', error);
      res.status(500).send('Internal server error');
  }
};

// Method to handle password reset form submission
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
      const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });

      if (!user) {
        res.render('passlinkexpired');
      } else {

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user's password
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Redirect or render a success page
      res.render('password-reset-success');
    }
  } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).send('Internal server error');
  }
};

exports.dashboard = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.render('dashboard', { username: req.user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.logoutUser = (req, res) => {
  req.logout(err => {
      if (err) {
          console.error(err);
      }
      res.redirect('/');
  });
};