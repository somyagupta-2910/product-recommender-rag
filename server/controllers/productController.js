const Product = require('../models/Product');
const { generateEmbedding, createProductText, storeEmbeddingInPinecone } = require('../utils/embeddingUtils');

/**
 * Add new products with embeddings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.addProducts = async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No valid products provided' });
    }
    
    const results = [];
    const errors = [];
    
    // Process each product
    for (const productData of products) {
      try {
        // Create default image if not provided
        if (!productData.image) {
          productData.image = `https://via.placeholder.com/400x300?text=${encodeURIComponent(productData.name)}`;
        }
        
        // Create and save the product in MongoDB
        const product = new Product(productData);
        await product.save();
        
        // Generate text representation for embedding
        const productText = createProductText(product);
        
        // Generate embedding
        const embedding = await generateEmbedding(productText);
        
        // Store embedding in Pinecone
        await storeEmbeddingInPinecone(product._id, embedding, {
          name: product.name,
          type: product.type,
          effects: product.effects.join(','),
          ingredients: product.ingredients.join(',')
        });
        
        results.push({
          id: product._id,
          name: product.name,
          status: 'success'
        });
      } catch (error) {
        console.error(`Error processing product ${productData.name}:`, error);
        errors.push({
          name: productData.name,
          error: error.message
        });
      }
    }
    
    // Return results
    return res.status(201).json({
      message: `Successfully processed ${results.length} products with ${errors.length} errors`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error in addProducts:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    return res.status(200).json({ product });
  } catch (error) {
    console.error('Error in getProductById:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update embedding in Pinecone
    const productText = createProductText(product);
    const embedding = await generateEmbedding(productText);
    
    await storeEmbeddingInPinecone(product._id, embedding, {
      name: product.name,
      type: product.type,
      effects: product.effects.join(','),
      ingredients: product.ingredients.join(',')
    });
    
    return res.status(200).json({ 
      message: 'Product updated successfully',
      product 
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
// ... continuing from previous code
exports.deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;
      
      const product = await Product.findByIdAndDelete(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Remove embedding from Pinecone
      try {
        const index = pinecone.Index(process.env.PINECONE_INDEX);
        await index.delete({
          ids: [id.toString()],
          namespace: 'products'
        });
      } catch (pineconeError) {
        console.error('Error deleting from Pinecone:', pineconeError);
        // Continue execution even if Pinecone delete fails
      }
      
      return res.status(200).json({ 
        message: 'Product deleted successfully',
        productId: id
      });
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  /**
   * Get product recommendations based on preferences
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  exports.getRecommendations = async (req, res) => {
    try {
      const { effect, type, limit = 5 } = req.query;
      
      // Build query text based on preferences
      let queryText = "Recommend products";
      if (effect) queryText += ` with ${effect} effect`;
      if (type) queryText += ` of type ${type}`;
      
      // Find similar product IDs using vector search
      const { findSimilarProducts } = require('../utils/embeddingUtils');
      const productIds = await findSimilarProducts(queryText, parseInt(limit));
      
      // Fetch full product details from MongoDB
      const products = await Product.find({
        _id: { $in: productIds }
      });
      
      // Sort products to match the order of productIds
      const sortedProducts = productIds.map(id => 
        products.find(product => product._id.toString() === id)
      ).filter(Boolean);
      
      return res.status(200).json({ 
        recommendations: sortedProducts
      });
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  /**
   * Bulk upload products from JSON
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  exports.bulkUpload = async (req, res) => {
    try {
      // This is handled by the addProducts method
      // Just pass through to that method
      return exports.addProducts(req, res);
    } catch (error) {
      console.error('Error in bulkUpload:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

/**
 * Search products using vector search
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Generate embedding for the search query
    const { generateEmbedding, findSimilarProducts } = require('../utils/embeddingUtils');
    
    // Find similar product IDs using vector search (limit to 10 results)
    const productIds = await findSimilarProducts(q, 10);
    
    // Fetch full product details from MongoDB
    const products = await Product.find({
      _id: { $in: productIds }
    });
    
    // Sort products to match the order of productIds (relevance order)
    const sortedProducts = productIds
      .map(id => products.find(product => product._id.toString() === id))
      .filter(Boolean);
    
    return res.status(200).json({ 
      products: sortedProducts
    });
  } catch (error) {
    console.error('Error in searchProducts:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};