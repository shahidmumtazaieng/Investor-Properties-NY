import dotenv from 'dotenv';
dotenv.config();

import { databaseHealthCheck, testDatabaseConnection, testSupabaseConnection } from './server/database.ts';

async function diagnoseDatabaseConnection() {
  console.log('=== Database Connection Diagnostic ===\n');
  
  try {
    // Test 1: Database health check
    console.log('1. Checking database health...');
    const health = await databaseHealthCheck();
    console.log('   Health status:', health);
    
    // Test 2: Direct database connection test
    console.log('\n2. Testing direct database connection...');
    const dbConnected = await testDatabaseConnection();
    console.log('   Direct database connection:', dbConnected ? 'SUCCESS' : 'FAILED');
    
    // Test 3: Supabase connection test
    console.log('\n3. Testing Supabase connection...');
    const supabaseConnected = await testSupabaseConnection();
    console.log('   Supabase connection:', supabaseConnected ? 'SUCCESS' : 'FAILED');
    
    console.log('\n=== Diagnostic Complete ===');
    
    // Provide recommendations based on results
    if (!dbConnected && !supabaseConnected) {
      console.log('\n⚠️  RECOMMENDATIONS:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify your Supabase credentials in .env file');
      console.log('   3. Ensure your Supabase project is active');
      console.log('   4. Check if there are firewall restrictions');
      console.log('   5. Try temporarily enabling FORCE_DEMO_MODE=true in your .env file');
    }
  } catch (error) {
    console.error('Error during diagnostic:', error);
  }
}

diagnoseDatabaseConnection();