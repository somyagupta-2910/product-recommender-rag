const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware.verifyToken);

// Checkout route
router.post('/checkout', orderController.checkout);

// Get user's purchased products
router.get('/purchased', orderController.getPurchasedProducts);

module.exports = router;