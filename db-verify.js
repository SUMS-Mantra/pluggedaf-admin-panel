// Helper functions for database verification
const { createClient } = require('@supabase/supabase-js');

/**
 * Verify the database schema for the Plugged e-commerce platform
 * @param {string} url - Supabase URL
 * @param {string} key - Supabase key
 */
async function verifyDatabaseSchema(url, key) {
  console.log('Verifying database schema...');
  
  try {
    const supabase = createClient(url, key);
    const requiredTables = [
      { name: 'products', schema: 'public' },
      { name: 'orders', schema: 'public' },
      { name: 'order_items', schema: 'public' },
      { name: 'profiles', schema: 'public' },
      { name: 'payment_instructions', schema: 'public' },
      { name: 'users', schema: 'auth' }
    ];
    const missingTables = [];
    
    // Check for required tables
    for (const table of requiredTables) {
      try {
        // For auth.users table, we need a different approach
        if (table.schema === 'auth' && table.name === 'users') {
          const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1 });
          
          if (error) {
            missingTables.push(`${table.schema}.${table.name}`);
            console.error(`Error checking ${table.schema}.${table.name}:`, error.message);
          } else {
            console.log(`✓ Table ${table.schema}.${table.name} exists and is accessible`);
          }
        } else {
          const { count, error } = await supabase
            .from(table.name)
            .select('*', { count: 'exact', head: true });
            
          if (error) {
            missingTables.push(`${table.schema}.${table.name}`);
            console.error(`Error checking table ${table.schema}.${table.name}:`, error.message);
          } else {
            console.log(`✓ Table ${table.schema}.${table.name} exists (${count} rows)`);
          }
        }
      } catch (error) {
        missingTables.push(`${table.schema}.${table.name}`);
        console.error(`Error checking table ${table.schema}.${table.name}:`, error.message);
      }
    }
    
    if (missingTables.length > 0) {
      console.error('Missing required tables:', missingTables.join(', '));
      return {
        success: false,
        message: `Missing required tables: ${missingTables.join(', ')}`
      };
    } else {
      console.log('All required tables exist!');
      return {
        success: true,
        message: 'Database schema verification successful'
      };
    }
  } catch (error) {
    console.error('Database verification error:', error.message);
    return {
      success: false,
      message: `Database verification error: ${error.message}`
    };
  }
}

module.exports = { verifyDatabaseSchema };
