import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.ts';
import { sql } from 'drizzle-orm';

// Load environment variables
dotenv.config();

async function testDrizzleConnection() {
  console.log('=== DRIZZLE ORM CONNECTION TEST ===\n');
  
  // Get the connection string
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.log('✗ No database connection string found');
    return;
  }
  
  console.log('Connection string found');
  console.log('Attempting to connect with Drizzle ORM...');
  
  try {
    // Create a connection
    const queryClient = postgres(connectionString, { 
      max: 1,
      timeout: 10000 // 10 second timeout
    });
    
    // Create Drizzle ORM instance
    const db = drizzle(queryClient, { schema });
    
    console.log('✓ Drizzle ORM initialized successfully');
    
    // Try a simple query
    console.log('Executing test query...');
    const result = await db.execute(sql`SELECT 1 as test`);
    
    console.log('✓ Query successful!');
    console.log('Query result:', result);
    
    // Close the connection
    await queryClient.end();
    
    console.log('\n=== DRIZZLE ORM CONNECTION TEST COMPLETED ===');
    
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
    
    // Check if it's a tenant error
    if (error instanceof Error && error.message.includes('Tenant')) {
      console.log('This appears to be a tenant error. The issue might be with:');
      console.log('1. The database URL format');
      console.log('2. The username or password');
      console.log('3. The database instance not being properly configured');
    }
  }
}

// Run the test
testDrizzleConnection();