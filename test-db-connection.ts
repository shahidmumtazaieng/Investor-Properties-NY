import { DatabaseRepository } from './server/database-repository';
import dotenv from 'dotenv';
import { db } from './server/database.ts';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema.ts';

// Load environment variables
dotenv.config();

// Test database connection
import { testDatabaseConnection, testSupabaseConnection } from './server/database.ts';

async function testConnections() {
  console.log('Testing database connections...');
  
  try {
    // Test direct database connection
    console.log('\n--- Testing Direct Database Connection ---');
    const dbConnected = await testDatabaseConnection();
    console.log('Direct database connection:', dbConnected ? 'SUCCESS' : 'FAILED');
    
    // Test Supabase connection
    console.log('\n--- Testing Supabase Connection ---');
    const supabaseConnected = await testSupabaseConnection();
    console.log('Supabase connection:', supabaseConnected ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('Error testing connections:', error);
  }
}

testConnections();
