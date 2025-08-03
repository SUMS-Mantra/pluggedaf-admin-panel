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
    '# Environment Configuration',
    'NODE_ENV=development',
    'PORT=3001',
    '',
    '# Supabase connection (replace with your actual values)',
    'SUPABASE_URL=https://your-project.supabase.co',
    'SUPABASE_SERVICE_ROLE_KEY=your-service-role-key',
    '',
    '# Backend API Configuration',
    'BACKEND_API_URL=https://your-backend-api.onrender.com',
    'BACKEND_API_URL_LOCAL=http://localhost:8000',
    '',
    '# Security',
    'JWT_SECRET=your-jwt-secret-key',
    '',
    '# CORS Configuration',
    'FRONTEND_URL=http://localhost:3000'
  ].join('\n');
  
  try {
    fs.writeFileSync(envPath, sampleEnv);
    console.log('Sample .env file created. Please update it with your real values.');
  } catch (error) {
    console.error('Error creating sample .env file:', error);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://localhost:3000',
  'https://localhost:3001',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL
].filter(Boolean);

// Enable CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// API routes for configuration management
app.get('/api/config/supabase', (req, res) => {
  res.json({
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  });
});

// Backend API configuration
app.get('/api/config/backend', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.json({
    apiUrl: isProduction ? process.env.BACKEND_API_URL : process.env.BACKEND_API_URL_LOCAL,
    environment: process.env.NODE_ENV || 'development',
    isProduction
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
  console.log('\n🚀 PluggedAF Admin Panel Starting...');
  console.log('─'.repeat(50));
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📁 Directory: ${__dirname}`);
  console.log(`🔧 Environment: ${NODE_ENV}`);
  console.log(`📡 Backend API: ${process.env.BACKEND_API_URL || process.env.BACKEND_API_URL_LOCAL || 'Not configured'}`);
  
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('✅ Supabase: Connected');
  } else {
    console.log('⚠️  Supabase: Configuration missing');
  }
  
  console.log('─'.repeat(50));
  console.log('📋 Available endpoints:');
  console.log('   • GET  /                    - Admin Panel Interface');
  console.log('   • GET  /api/config/backend  - Backend Configuration');
  console.log('   • GET  /api/config/supabase - Supabase Configuration');
  console.log('   • POST /api/verify-database - Database Schema Check');
  console.log('─'.repeat(50));
  
  if (NODE_ENV === 'production') {
    console.log('🏭 Production mode active');
  } else {
    console.log('🔧 Development mode - CORS enabled for all origins');
  }
  
  console.log('\n🎯 Admin panel ready! Open your browser to get started.\n');
});
