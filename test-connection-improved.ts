import dotenv from 'dotenv';
dotenv.config();

import { databaseHealthCheck, testDatabaseConnection, testSupabaseConnection } from './server/database.ts';

async function testConnections() {
  console.log('Testing improved database connections...\n');
  
  try {
    // Test database health
    console.log('--- Testing Database Health ---');
    const health = await databaseHealthCheck();
    console.log('Health check result:', health);
    
    // Test direct database connection
    console.log('\n--- Testing Direct Database Connection ---');
    const dbConnected = await testDatabaseConnection();
    console.log('Direct database connection:', dbConnected ? 'SUCCESS' : 'FAILED');
    
    // Test Supabase connection
    console.log('\n--- Testing Supabase Connection ---');
    const supabaseConnected = await testSupabaseConnection();
    console.log('Supabase connection:', supabaseConnected ? 'SUCCESS' : 'FAILED');
    
    console.log('\nConnection tests completed.');
  } catch (error) {
    console.error('Error testing connections:', error);
  }
}

testConnections();