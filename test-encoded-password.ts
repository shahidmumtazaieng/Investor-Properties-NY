import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables
dotenv.config();

async function testEncodedPassword() {
  console.log('=== ENCODED PASSWORD TEST ===\n');
  
  // Get the original connection string
  const originalConnectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!originalConnectionString) {
    console.log('✗ No database connection string found');
    return;
  }
  
  console.log('Original connection string:');
  console.log(originalConnectionString);
  console.log('');
  
  // Try to encode the @ in the password
  // Replace "Shahid@786123" with "Shahid%40786123"
  const encodedConnectionString = originalConnectionString.replace('Shahid@786123', 'Shahid%40786123');
  
  console.log('Encoded connection string:');
  console.log(encodedConnectionString);
  console.log('');
  
  try {
    console.log('Attempting connection with encoded password...');
    
    // Create a connection with the encoded password
    const sql = postgres(encodedConnectionString, { 
      max: 1,
      timeout: 10000 // 10 second timeout
    });
    
    // Try a simple query
    console.log('Executing test query...');
    const result = await sql`SELECT 1 as test`;
    
    console.log('✓ Connection successful with encoded password!');
    console.log('Query result:', result);
    
    // Close the connection
    await sql.end();
    
  } catch (error) {
    console.log('✗ Connection failed with encoded password:');
    console.log('Error:', error instanceof Error ? error.message : String(error));
  }
  
  console.log('\n=== ENCODED PASSWORD TEST COMPLETED ===');
}

// Run the test
testEncodedPassword();