const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('Error loading .env file:', result.error);
  } else {
    console.log('Environment variables loaded from .env file');
  }
} else {
  // Create a sample .env file if it doesn't exist
  console.log('Creating sample .env file...');
  const sampleEnv = [
    '# Supabase connection (replace with your actual values)',
    'SUPABASE_URL=https://your-project.supabase.co',
    'SUPABASE_SERVICE_ROLE_KEY=your-service-role-key',
    '# Backend API URL',
    'BACKEND_URL=http://localhost:8000'
  ].join('\n');
  
  try {
    fs.writeFileSync(envPath, sampleEnv);
    console.log('Sample .env file created. Please update it with your real values.');
  } catch (error) {
    console.error('Error creating sample .env file:', error);
  }
}

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// API routes for configuration management
app.get('/api/config/supabase', (req, res) => {
  res.json({
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  });
});

app.post('/api/config/supabase', (req, res) => {
  const { url, key } = req.body;
  
  // In a real application, you might want to store this in a database
  // For now, we'll just validate and return success
  if (!url || !key) {
    return res.status(400).json({ error: 'URL and key are required' });
  }
  
  res.json({ success: true });
});

// Session management (in-memory for demo - use Redis or database in production)
let sessions = new Map();

app.post('/api/session', (req, res) => {
  const { session } = req.body;
  const sessionId = Date.now().toString();
  sessions.set(sessionId, session);
  res.json({ sessionId });
});

app.get('/api/session/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  res.json({ session: session || null });
});

app.delete('/api/session/:sessionId', (req, res) => {
  sessions.delete(req.params.sessionId);
  res.json({ success: true });
});

// Database verification endpoint
app.post('/api/verify-database', async (req, res) => {
  try {
    const { verifyDatabaseSchema } = require('./db-verify');
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      return res.status(400).json({ 
        success: false, 
        message: 'Supabase configuration not found' 
      });
    }
    
    const result = await verifyDatabaseSchema(url, key);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Plugged Admin Web Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('✅ Supabase configuration loaded from environment');
  } else {
    console.log('⚠️  Supabase configuration not found. Please check your .env file.');
  }
});
