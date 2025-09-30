import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

function detailedDebug() {
  console.log('=== DETAILED DEBUG ===\n');
  
  // Check the connection strings from environment variables
  const supabaseDbUrl = process.env.SUPABASE_DATABASE_URL;
  const databaseUrl = process.env.DATABASE_URL;
  
  console.log('SUPABASE_DATABASE_URL:');
  console.log(typeof supabaseDbUrl, JSON.stringify(supabaseDbUrl));
  console.log('');
  
  console.log('DATABASE_URL:');
  console.log(typeof databaseUrl, JSON.stringify(databaseUrl));
  console.log('');
  
  // Check which one is being used
  const connectionString = supabaseDbUrl || databaseUrl || 'postgresql://demo:demo@localhost:5432/demo';
  
  console.log('Actual connection string being used:');
  console.log(typeof connectionString, JSON.stringify(connectionString));
  console.log('');
  
  // Check if it matches the demo string
  const demoString = 'postgresql://demo:demo@localhost:5432/demo';
  console.log('Demo string:');
  console.log(typeof demoString, JSON.stringify(demoString));
  console.log('');
  
  console.log('Strict equality (===):', connectionString === demoString);
  console.log('Loose equality (==):', connectionString == demoString);
  console.log('');
  
  // Character by character comparison
  console.log('Character by character comparison:');
  if (connectionString.length !== demoString.length) {
    console.log('Different lengths:', connectionString.length, 'vs', demoString.length);
  } else {
    console.log('Same length:', connectionString.length);
  }
  
  // Show first 50 characters of each
  console.log('First 50 chars of connection string:', connectionString.substring(0, 50));
  console.log('First 50 chars of demo string:     ', demoString.substring(0, 50));
  
  console.log('=== DETAILED DEBUG COMPLETED ===');
}

// Run the debug
detailedDebug();