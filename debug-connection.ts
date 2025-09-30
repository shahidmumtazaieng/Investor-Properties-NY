import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

function debugConnection() {
  console.log('=== DEBUG CONNECTION ===\n');
  
  // Check the connection strings from environment variables
  const supabaseDbUrl = process.env.SUPABASE_DATABASE_URL;
  const databaseUrl = process.env.DATABASE_URL;
  
  console.log('SUPABASE_DATABASE_URL:');
  console.log(supabaseDbUrl);
  console.log('');
  
  console.log('DATABASE_URL:');
  console.log(databaseUrl);
  console.log('');
  
  // Check which one is being used
  const connectionString = supabaseDbUrl || databaseUrl || 'postgresql://demo:demo@localhost:5432/demo';
  
  console.log('Actual connection string being used:');
  console.log(connectionString);
  console.log('');
  
  // Check if it matches the demo string
  const demoString = 'postgresql://demo:demo@localhost:5432/demo';
  console.log('Matches demo string:', connectionString === demoString);
  console.log('');
  
  // Show the comparison
  console.log('Comparison:');
  console.log('Connection string:', connectionString);
  console.log('Demo string:     ', demoString);
  console.log('');
  
  console.log('=== DEBUG CONNECTION COMPLETED ===');
}

// Run the debug
debugConnection();