// Simple database connection test
const { createClient } = require('@supabase/supabase-js');

// Use the credentials from your .env file
const supabaseUrl = 'https://mxjjjoyqkpucrhadezti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ampqb3lxa3B1Y3JoYWRlenRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMzNjgwNiwiZXhwIjoyMDcyOTEyODA2fQ.rn8X9oAC_SMg07icJTB6Oom4BuW4VBZz7lKsE1LRpxQ';

console.log('Testing database connection...');
console.log('Supabase URL:', supabaseUrl);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    
    // Test basic connection by querying a simple operation
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('Error details:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log('Sample data:', data);
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