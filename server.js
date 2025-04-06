import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config(); // Load .env file

// Also load .env.local if it exists (for local development)
const envLocalPath = join(dirname(fileURLToPath(import.meta.url)), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocalConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const k in envLocalConfig) {
    process.env[k] = envLocalConfig[k];
  }
  console.log('Loaded environment variables from .env.local');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import API handlers
import eventSearchHandler from './api/eventSearch.js';
import chatHandler from './api/chat.js';
import addEventHandler from './api/addEvent.js';

// API routes
app.post('/eventSearch', async (req, res) => {
  try {
    await eventSearchHandler(req, res);
  } catch (error) {
    console.error('Error in eventSearch endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/chat', async (req, res) => {
  try {
    await chatHandler(req, res);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/addEvent', async (req, res) => {
  try {
    await addEventHandler(req, res);
  } catch (error) {
    console.error('Error in addEvent endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});