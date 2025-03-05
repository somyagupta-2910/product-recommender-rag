const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/recommendations', productController.getRecommendations);
router.get('/:id', productController.getProductById);

// Protected routes (admin only)
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, productController.addProducts);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, productController.updateProduct);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, productController.deleteProduct);
router.post('/bulk-upload', authMiddleware.verifyToken, authMiddleware.isAdmin, productController.bulkUpload);

module.exports = router;