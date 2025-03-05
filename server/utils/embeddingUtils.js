const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone client
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

/**
 * Generate embedding for product text
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<Array<number>>} - Embedding vector
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Create a text representation of a product for embedding
 * @param {Object} product - Product object
 * @returns {string} - Text representation
 */
function createProductText(product) {
  return `
    Product: ${product.name}
    Type: ${product.type}
    Description: ${product.description}
    Effects: ${product.effects.join(', ')}
    Ingredients: ${product.ingredients.join(', ')}
  `;
}

/**
 * Store product embedding in Pinecone
 * @param {string} productId - MongoDB product ID
 * @param {Array<number>} embedding - Embedding vector
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<void>}
 */
async function storeEmbeddingInPinecone(productId, embedding, metadata = {}) {
  try {
    const index = pinecone.Index(process.env.PINECONE_INDEX);
    
    await index.upsert([{
      id: productId.toString(),
      values: embedding,
      metadata: {
        ...metadata,
        productId: productId.toString()
      }
    }]);
  } catch (error) {
    console.error('Error storing embedding in Pinecone:', error);
    throw new Error('Failed to store embedding in vector database');
  }
}

/**
 * Find similar products based on query
 * @param {string} queryText - Query text
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array<string>>} - Array of product IDs
 */
async function findSimilarProducts(queryText, limit = 5) {
  try {
    const queryEmbedding = await generateEmbedding(queryText);
    const index = pinecone.Index(process.env.PINECONE_INDEX);
    
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true
    });
    
    return queryResponse.matches.map(match => match.metadata.productId);
  } catch (error) {
    console.error('Error finding similar products:', error);
    throw new Error('Failed to find similar products');
  }
}

module.exports = {
  generateEmbedding,
  createProductText,
  storeEmbeddingInPinecone,
  findSimilarProducts
};