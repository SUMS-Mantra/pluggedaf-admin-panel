// Test script to verify Supabase client integration
const { createClient } = require('@supabase/supabase-js');

/**
 * Test Supabase connection and return a promise
 * @param {string} url - Supabase URL
 * @param {string} key - Supabase key
 * @returns {Promise<object>} - Promise with connection result
 */
function testSupabaseConnection(url, key) {
  console.log('Testing Supabase connection...');
  
  return new Promise((resolve, reject) => {
    try {
      // Create Supabase client
      const supabase = createClient(url, key);
      
      // Test a simple query
      supabase.from('products').select('*', { count: 'exact', head: true })
        .then(({ count, error }) => {
          if (error) {
            console.error('Supabase query error:', error.message);
            reject(new Error(`Supabase query error: ${error.message}`));
          } else {
            console.log('Supabase connection successful!');
            console.log(`Found ${count} products in the database.`);
            resolve({ success: true, count, message: `Connected successfully. Found ${count} products.` });
          }
        })
        .catch(err => {
          console.error('Supabase connection error:', err.message);
          reject(new Error(`Supabase connection error: ${err.message}`));
        });
        
    } catch (error) {
      console.error('Supabase client initialization error:', error.message);
      reject(new Error(`Supabase client initialization error: ${error.message}`));
    }
  });
}

// Export the test function
module.exports = { testSupabaseConnection };
