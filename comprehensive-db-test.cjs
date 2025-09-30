// Comprehensive database connection test
require('dotenv').config();

console.log('=== Database Connection Test ===');
console.log('Environment Variables:');
console.log('- FORCE_DEMO_MODE:', process.env.FORCE_DEMO_MODE || 'not set');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- SUPABASE_DATABASE_URL exists:', !!process.env.SUPABASE_DATABASE_URL);

// Mask the password in the connection string for security
if (process.env.SUPABASE_DATABASE_URL) {
  const maskedUrl = process.env.SUPABASE_DATABASE_URL.replace(/:[^:@/]+@/, ':****@');
  console.log('- SUPABASE_DATABASE_URL (masked):', maskedUrl);
}

console.log('\n=== Testing Database Connection ===');

// Import and test the actual database connection
(async () => {
  try {
    // Dynamically import the database module
    const databaseModule = await import('./server/database.ts');
    const { db, queryClient, testDatabaseConnection, testSupabaseConnection } = databaseModule;
    
    console.log('Database module loaded successfully');
    console.log('- Database object exists:', !!db);
    console.log('- Query client exists:', !!queryClient);
    
    if (db) {
      console.log('Database connection appears to be active');
      console.log('Running database connection test...');
      
      try {
        const result = await testDatabaseConnection();
        console.log('Database connection test result:', result ? 'PASSED' : 'FAILED');
      } catch (error) {
        console.error('Database connection test error:', error.message);
      }
    } else {
      console.log('Database connection is NULL - running in demo mode');
      console.log('This means institutional investor functions will use demo data only');
      
      console.log('\n=== Possible Causes ===');
      console.log('1. Database credentials may be incorrect');
      console.log('2. Network connectivity issues to the database server');
      console.log('3. Database server may be down or inaccessible');
      console.log('4. Special characters in password may not be properly encoded');
      
      console.log('\n=== Troubleshooting Steps ===');
      console.log('1. Verify SUPABASE_DATABASE_URL in .env file is correct');
      console.log('2. Test database connectivity using a database client');
      console.log('3. Check if the database server is accessible from this machine');
      console.log('4. Ensure special characters in passwords are URL encoded (e.g., @ becomes %40)');
    }
    
    // Test Supabase connection as well
    console.log('\nTesting Supabase connection...');
    try {
      const supabaseResult = await testSupabaseConnection();
      console.log('Supabase connection test result:', supabaseResult ? 'PASSED' : 'FAILED');
    } catch (error) {
      console.error('Supabase connection test error:', error.message);
    }
    
  } catch (importError) {
    console.error('Failed to import database module:', importError.message);
    console.log('This suggests there may be issues with the database configuration or dependencies');
  }
})();