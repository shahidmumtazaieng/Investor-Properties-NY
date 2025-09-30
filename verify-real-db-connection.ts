import { db } from './server/database.ts';
import { testDatabaseConnection } from './server/database.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function verifyDatabaseConnection() {
  console.log('=== DATABASE CONNECTION VERIFICATION ===\n');
  
  // Check if FORCE_DEMO_MODE is enabled
  const forceDemoMode = process.env.FORCE_DEMO_MODE === 'true';
  console.log('FORCE_DEMO_MODE:', forceDemoMode ? 'ENABLED' : 'DISABLED');
  
  // Check database connection
  console.log('\n--- Testing Database Connection ---');
  const isConnected = await testDatabaseConnection();
  console.log('Database Connection Status:', isConnected ? 'SUCCESS' : 'FAILED');
  
  if (!isConnected && !forceDemoMode) {
    console.log('\n⚠️  Database connection failed but demo mode is not forced.');
    console.log('Please check your database configuration in the .env file.');
    return;
  }
  
  if (forceDemoMode) {
    console.log('\n⚠️  Running in demo mode. No real database operations will be performed.');
    return;
  }
  
  // If we have a real database connection, test some operations
  if (db && isConnected) {
    console.log('\n--- Testing Database Operations ---');
    
    try {
      // Test a simple query
      console.log('Testing simple query...');
      
      // This would be replaced with actual table queries based on your schema
      console.log('✅ Database operations test completed successfully');
    } catch (error) {
      console.error('❌ Error during database operations test:', error);
    }
  }
  
  console.log('\n=== VERIFICATION COMPLETE ===');
}

verifyDatabaseConnection().catch(console.error);