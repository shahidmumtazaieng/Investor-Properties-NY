import dotenv from 'dotenv';
import { URL } from 'url';

// Load environment variables
dotenv.config();

function parseConnectionString() {
  console.log('=== CONNECTION STRING PARSING TEST ===\n');
  
  // Get the connection string
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.log('✗ No database connection string found');
    return;
  }
  
  console.log('Raw connection string:');
  console.log(connectionString);
  console.log('');
  
  try {
    // Parse the URL
    const url = new URL(connectionString);
    
    console.log('Parsed connection details:');
    console.log('Protocol:', url.protocol);
    console.log('Username:', url.username);
    console.log('Password:', url.password ? '****' : 'Not set');
    console.log('Hostname:', url.hostname);
    console.log('Port:', url.port);
    console.log('Pathname:', url.pathname);
    console.log('');
    
    // Check if password contains special characters
    if (url.password && url.password.includes('@')) {
      console.log('⚠ Password contains @ character which might cause parsing issues');
      console.log('This could be causing the "Tenant or user not found" error');
      console.log('');
      
      console.log('Suggested fix:');
      console.log('1. Change your Supabase database password to not contain @ character');
      console.log('2. Or URL encode the @ character as %40 in the connection string');
      console.log('');
    }
    
  } catch (error) {
    console.log('✗ Failed to parse connection string:');
    console.log('Error:', error instanceof Error ? error.message : String(error));
    console.log('');
    
    // Try to manually parse
    console.log('Attempting manual parsing...');
    const parts = connectionString.split('://')[1];
    if (parts) {
      const [auth, host] = parts.split('@');
      if (auth && host) {
        const [username, password] = auth.split(':');
        console.log('Manual parse results:');
        console.log('Username:', username);
        console.log('Password contains @:', password ? password.includes('@') : 'No password');
        console.log('Host:', host);
      }
    }
  }
  
  console.log('\n=== CONNECTION STRING PARSING TEST COMPLETED ===');
}

// Run the test
parseConnectionString();