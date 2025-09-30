import dotenv from 'dotenv';
import { Client } from 'pg';

// Load environment variables
dotenv.config();

async function testDirectConnection() {
  console.log('=== DIRECT POSTGRES CONNECTION TEST ===\n');
  
  // Get the connection string
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.log('✗ No database connection string found');
    return;
  }
  
  console.log('Connection string found');
  console.log('Attempting direct connection...');
  
  // Try to parse the connection string to get individual components
  try {
    const url = new URL(connectionString);
    
    console.log('Connection details:');
    console.log('  Host:', url.hostname);
    console.log('  Port:', url.port || 5432);
    console.log('  Database:', url.pathname.substring(1));
    console.log('  Username:', url.username);
    console.log('  Password: ****');
    console.log('');
    
    // Try connecting directly without pooler
    // Replace pooler URL with direct database URL
    const directUrl = connectionString.replace('pooler.', '');
    console.log('Trying direct connection (without pooler):');
    console.log(directUrl);
    console.log('');
    
    const client = new Client({
      connectionString: directUrl,
    });
    
    await client.connect();
    console.log('✓ Direct connection successful!');
    
    const result = await client.query('SELECT 1 as test');
    console.log('Query result:', result.rows);
    
    await client.end();
    
  } catch (error) {
    console.log('✗ Direct connection failed:');
    console.log('Error:', error instanceof Error ? error.message : String(error));
    
    // Try with the original connection string
    console.log('\nTrying with original connection string...');
    try {
      const client = new Client({
        connectionString: connectionString,
      });
      
      await client.connect();
      console.log('✓ Original connection successful!');
      
      const result = await client.query('SELECT 1 as test');
      console.log('Query result:', result.rows);
      
      await client.end();
    } catch (origError) {
      console.log('✗ Original connection also failed:');
      console.log('Error:', origError instanceof Error ? origError.message : String(origError));
    }
  }
  
  console.log('\n=== DIRECT POSTGRES CONNECTION TEST COMPLETED ===');
}

// Run the test
testDirectConnection();