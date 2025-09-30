import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing database connection...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test database connection
async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    
    // Test basic connection by querying a simple table
    const { data, error, count } = await supabase
      .from('users')
      .select('count()', { count: 'exact' });
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log('Users table count:', count);
    return true;
    
  } catch (error) {
    console.error('❌ Error testing database connection:', error.message);
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Database connection test completed successfully');
    } else {
      console.error('\n💥 Database connection test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error during database test:', error);
    process.exit(1);
  });