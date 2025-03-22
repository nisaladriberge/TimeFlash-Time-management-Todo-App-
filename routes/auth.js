const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).render('register', { 
          error: 'Email already in use',
          username,
          email
        });
      } else {
        return res.status(400).render('register', { 
          error: 'Username already taken',
          username,
          email
        });
      }
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password
    });
    
    await newUser.save();
    
    // Create session/token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set cookie with the token
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict'
    });
    
    res.redirect('/');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).render('register', { 
      error: 'An error occurred during registration',
      username: req.body.username,
      email: req.body.email
    });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(400).render('login', { 
        error: 'Invalid username or password',
        username
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).render('login', { 
        error: 'Invalid username or password',
        username
      });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set cookie with the token
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict'
    });
    
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('login', { 
      error: 'An error occurred during login',
      username: req.body.username
    });
  }
});

// User Logout
router.get('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.redirect('/auth/login');
});

// GET route for login page
router.get('/login', (req, res) => {
  res.render('login', { error: null, username: '' });
});

// GET route for register page
router.get('/register', (req, res) => {
  res.render('register', { error: null, username: '', email: '' });
});

module.exports = router;