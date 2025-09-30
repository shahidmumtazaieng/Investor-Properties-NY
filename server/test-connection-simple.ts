import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('Data length:', data?.length || 0);
    return true;
    
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Connection test completed successfully');
    } else {
      console.error('\n❌ Connection test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during connection test:', error);
    process.exit(1);
  });