// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token
 */
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Removing the isAdmin middleware - all authenticated users will have access
// Instead, providing a simple middleware that just passes through
exports.isAdmin = (req, res, next) => {
  // Simply pass through - all authenticated users are treated as having full access
  next();
};

