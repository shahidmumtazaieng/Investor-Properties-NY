import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables
dotenv.config();

// Test the database connection directly
async function testDirectConnection() {
  console.log('Testing direct database connection...\n');
  
  // Use the connection string from the environment
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.log('No database connection string found in environment variables');
    return;
  }
  
  console.log('Connection string (masked):', connectionString.replace(/:[^:@/]+@/, ':****@'));
  
  try {
    // Try with a very short timeout to see if we can connect at all
    const sql = postgres(connectionString, { 
      connect_timeout: 5, // 5 seconds timeout
      max: 1 // Only one connection
    });
    
    console.log('Attempting to connect...');
    const result = await sql`SELECT 1 as test`;
    console.log('Connection successful! Result:', result);
    
    // Close the connection
    await sql.end();
    
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testDirectConnection();