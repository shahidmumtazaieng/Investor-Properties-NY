import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables
dotenv.config();

async function testPostgresConnection() {
  console.log('=== POSTGRES CONNECTION TEST ===\n');
  
  // Get the connection string
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.log('✗ No database connection string found');
    return;
  }
  
  console.log('Connection string found');
  console.log('Attempting to connect...');
  
  try {
    // Create a connection
    const sql = postgres(connectionString, { 
      max: 1,
      timeout: 10000 // 10 second timeout
    });
    
    // Try a simple query
    console.log('Executing test query...');
    const result = await sql`SELECT 1 as test`;
    
    console.log('✓ Connection successful!');
    console.log('Query result:', result);
    
    // Close the connection
    await sql.end();
    
  } catch (error) {
    console.log('✗ Connection failed:');
    console.log('Error:', error instanceof Error ? error.message : String(error));
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('authentication')) {
      console.log('This appears to be an authentication error. Please check your credentials.');
    }
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('connect')) {
      console.log('This appears to be a connection error. Please check your network and connection string.');
    }
  }
  
  console.log('\n=== POSTGRES CONNECTION TEST COMPLETED ===');
}

// Run the test
testPostgresConnection();