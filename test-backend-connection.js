// Backend Connection Test Script
// This script tests the connection to the PluggedAF backend API

const fetch = require('node-fetch');
require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

async function testBackendConnection() {
  console.log('🔍 Testing PluggedAF Backend Connection...');
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  console.log('─'.repeat(50));

  const tests = [
    {
      name: 'Health Check',
      endpoint: '/api/health',
      method: 'GET'
    },
    {
      name: 'Products Endpoint',
      endpoint: '/api/products',
      method: 'GET'
    },
    {
      name: 'Orders Endpoint', 
      endpoint: '/api/orders',
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🧪 Testing ${test.name}...`);
      
      const response = await fetch(`${BACKEND_URL}${test.endpoint}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.ok) {
        console.log(`✅ ${test.name}: SUCCESS (${response.status})`);
      } else {
        console.log(`❌ ${test.name}: FAILED (${response.status} ${response.statusText})`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }

  console.log('─'.repeat(50));
  console.log('🏁 Backend connection test completed');
}

// Run the test
if (require.main === module) {
  testBackendConnection().catch(console.error);
}

module.exports = { testBackendConnection };
