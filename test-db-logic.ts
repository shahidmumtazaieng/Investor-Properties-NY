import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

function testDbLogic() {
  console.log('=== DATABASE LOGIC TEST ===\n');
  
  // Replicate the logic from database.ts
  const demoString = 'postgresql://demo:demo@localhost:5432/demo';
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || demoString;
  
  console.log('Connection string:', connectionString ? 'Configured' : 'Not found');
  console.log('Demo string:', demoString);
  console.log('Are they equal:', connectionString === demoString);
  
  if (connectionString && connectionString !== demoString) {
    console.log('Using configured database connection');
  } else {
    console.warn('Warning: Using demo database connection. Database operations will use mock data.');
  }
  
  console.log('\n=== DATABASE LOGIC TEST COMPLETED ===');
}

// Run the test
testDbLogic();