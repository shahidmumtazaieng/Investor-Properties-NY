import dotenv from 'dotenv';
import { supabase, testDatabaseConnection } from './server/database.ts';

// Load environment variables
dotenv.config();

console.log('=== Database Connection Test ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// Test the database connection
async function runTest() {
  console.log('\n1. Testing Supabase client connection...');
  
  try {
    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact' });
    
    if (error) {
      console.error('❌ Supabase query failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase client connection successful');
    console.log('Users count:', data);
    
    // Test the helper function
    console.log('\n2. Testing database helper function...');
    const result = await testDatabaseConnection();
    
    if (result) {
      console.log('✅ Database helper function test successful');
    } else {
      console.log('❌ Database helper function test failed');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error during database test:', error.message);
    return false;
  }
}

// Run the test
runTest()
  .then(success => {
    if (success) {
      console.log('\n🎉 All database connection tests passed!');
    } else {
      console.log('\n💥 Some database connection tests failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });