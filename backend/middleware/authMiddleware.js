const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'furnishopsy_secret_key');

      // Get user from the token (exclude password)
      if (mongooseConnectionActive()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        // Fallback user retrieval from local storage mock
        const jsonDb = require('../jsonDb');
        const user = jsonDb.getUsers().find(u => u._id === decoded.id || u.id === decoded.id);
        if (user) {
          const userCopy = { ...user };
          delete userCopy.password;
          req.user = userCopy;
        }
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Helper function to check if mongoose connection is active
function mongooseConnectionActive() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
}

module.exports = { protect, admin };
