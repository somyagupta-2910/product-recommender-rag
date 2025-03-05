const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Process checkout and add products to user's purchased list
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.checkout = async (req, res) => {
  try {
    const { productIds } = req.body;
    const userId = req.userId;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'No products provided for checkout' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate all product IDs exist
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'One or more products not found' });
    }
    
    // Add products to user's productsBought array
    user.productsBought.push(...productIds);
    await user.save();
    
    // Clear user's cart
    user.cart = [];
    await user.save();
    
    // In a real application, you would process payment here
    
    return res.status(200).json({
      success: true,
      message: 'Checkout successful',
      purchasedProducts: products.map(p => ({
        id: p._id,
        name: p.name
      }))
    });
  } catch (error) {
    console.error('Error in checkout:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user's purchased products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getPurchasedProducts = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find user and populate their purchased products
    const user = await User.findById(userId).populate('productsBought');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({
      success: true,
      products: user.productsBought
    });
  } catch (error) {
    console.error('Error in getPurchasedProducts:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};