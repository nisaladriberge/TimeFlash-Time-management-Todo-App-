const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = {
  // Middleware to authenticate users
  authenticate: async (req, res, next) => {
    try {
      const token = req.cookies.auth_token;
      
      if (!token) {
        return res.redirect('/auth/login');
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by ID
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.redirect('/auth/login');
      }
      
      // Set user in request object
      req.user = user;
      next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      res.clearCookie('auth_token');
      res.redirect('/auth/login');
    }
  },
  
  // Middleware to check if user is already logged in
  redirectIfAuthenticated: async (req, res, next) => {
    try {
      const token = req.cookies.auth_token;
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user) {
          return res.redirect('/');
        }
      }
      
      next();
    } catch (err) {
      res.clearCookie('auth_token');
      next();
    }
  }
};