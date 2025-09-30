import { DatabaseRepository } from './server/database-repository';
import { db } from './server/database.ts';
import * as schema from './shared/schema.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  if (!db) {
    console.log('No database connection available (demo mode)');
    return;
  }
  
  try {
    // Test a simple query
    console.log('Attempting to query admin users...');
    const result = await db.select().from(schema.adminUsers).limit(1);
    console.log('Database query successful!');
    console.log('Result:', result);
  } catch (error) {
    console.error('Database query failed:', error);
  }
}

testDatabaseConnection();
