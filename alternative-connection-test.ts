import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables
dotenv.config();

async function alternativeConnectionTest() {
  console.log('=== ALTERNATIVE CONNECTION TEST ===\n');
  
  // Get the original connection string
  const originalConnectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!originalConnectionString) {
    console.log('✗ No database connection string found');
    return;
  }
  
  console.log('Original connection string (masked):');
  console.log(originalConnectionString.replace(/:[^:@/]+@/, ':****@'));
  console.log('');
  
  // Try different variations of the connection string
  const variations = [
    // Original
    originalConnectionString,
    
    // Simplified username (just 'postgres')
    originalConnectionString.replace('postgres.mxjjjoyqkpucrhadezti', 'postgres'),
    
    // Without pooler
    originalConnectionString.replace('pooler.', ''),
    
    // Simplified username and without pooler
    originalConnectionString.replace('postgres.mxjjjoyqkpucrhadezti', 'postgres').replace('pooler.', ''),
  ];
  
  for (let i = 0; i < variations.length; i++) {
    console.log(`Testing variation ${i + 1}:`);
    const variation = variations[i];
    console.log('  Connection string (masked):', variation.replace(/:[^:@/]+@/, ':****@'));
    
    try {
      const client = postgres(variation, { max: 1, timeout: 10000 });
      const result = await client`SELECT 1 as test`;
      console.log('  ✓ Connection successful!');
      console.log('  Result:', result);
      await client.end();
      return; // If one works, we're done
    } catch (error) {
      console.log('  ✗ Connection failed:', error instanceof Error ? error.message : String(error));
    }
    console.log('');
  }
  
  console.log('=== ALTERNATIVE CONNECTION TEST COMPLETED ===');
  console.log('None of the connection variations worked. You may need to:');
  console.log('1. Check your Supabase dashboard for the correct connection string');
  console.log('2. Reset your database password');
  console.log('3. Contact Supabase support if the issue persists');
}

// Run the test
alternativeConnectionTest();