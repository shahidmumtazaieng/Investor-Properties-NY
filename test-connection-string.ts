import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables
dotenv.config();

function testConnectionString() {
  console.log('=== CONNECTION STRING TEST ===\n');
  
  // Check the connection string from environment variables
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.log('✗ No database connection string found in environment variables');
    return;
  }
  
  console.log('Database connection string found:');
  console.log(connectionString);
  console.log('');
  
  // Hide sensitive information for display
  const displayString = connectionString.replace(/:[^:@/]+@/, ':****@');
  console.log('Connection string (masked):');
  console.log(displayString);
  console.log('');
  
  // Check if it contains demo
  if (connectionString.includes('demo')) {
    console.log('⚠ Connection string is still using demo values');
  } else {
    console.log('✓ Connection string appears to be configured for real database');
  }
  
  console.log('\n=== CONNECTION STRING TEST COMPLETED ===');
}

// Run the test
testConnectionString();