// contentProcessor.js

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { PlaywrightCrawler } = require('crawlee');
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai').default;
const MAX_TOKENS = 8000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Split text into smaller chunks based on estimated token count
function chunkText(text, maxTokens = MAX_TOKENS) {
  const sentences = text.split('. ');
  const chunks = [];
  let currentChunk = [];

  sentences.forEach((sentence) => {
    const newChunk = [...currentChunk, sentence];
    const tokenCount = newChunk.join('. ').length; // Estimate tokens based on character length

    if (tokenCount > maxTokens) {
      chunks.push(currentChunk.join('. '));
      currentChunk = [sentence];
    } else {
      currentChunk = newChunk;
    }
  });

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('. '));
  }

  return chunks;
}
  
// Process text and create embeddings for each chunk.
// Returns an array of objects: { chunk, embedding }
async function createEmbeddingsForChunks(text) {
  const chunks = chunkText(text);
  const embeddingsWithText = [];
  
  for (const chunk of chunks) {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk,
    });
  
    embeddingsWithText.push({
      chunk,
      embedding: response.data[0].embedding
    });
  }
  
  return embeddingsWithText;
}

// Process PDF files
async function processPDF(buffer) {
  const data = await pdfParse(buffer);
  const text = data.text;
  return createEmbeddingsForChunks(text);
}

// Process DOC/DOCX files
async function processDoc(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value;
  return createEmbeddingsForChunks(text);
}

// Process websites (if needed)
async function processWebsite(url) {
  let text = '';
  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 1,
    requestHandlerTimeoutSecs: 60, // 1-minute timeout for each request
    async requestHandler({ page }) {
      const content = await page.content();
      const text = await page.evaluate(() => document.body.innerText);
      console.log('Website content fetched successfully');
      return text;
    },
  });
      
  await crawler.run([url]);
  return createEmbeddingsForChunks(text);
}

// Create a single embedding for a given text (if needed)
async function createEmbeddings(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// Store embeddings in Pinecone (if storing as a batch)
async function storeEmbeddings(courseId, embeddings, metadata) {
  const index = pinecone.Index(process.env.PINECONE_INDEX);
  
  await index.upsert([{
    id: `${courseId}-${Date.now()}`,
    values: embeddings,
    metadata: {
      courseId,
      ...metadata
    }
  }]);
}

module.exports = {
  processPDF,
  processDoc,
  processWebsite,
  createEmbeddings,
  storeEmbeddings,
  chunkText,
  createEmbeddingsForChunks
};
