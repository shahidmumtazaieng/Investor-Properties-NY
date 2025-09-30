import { db } from './server/database.ts';
import * as schema from './shared/schema.ts';

async function testRealDatabase() {
  console.log('Testing real database connection...');
  
  if (!db) {
    console.log('No database connection available');
    return;
  }
  
  try {
    // Test connection by querying a simple table
    console.log('Attempting to query common investors...');
    const commonInvestors = await db.select().from(schema.commonInvestors).limit(5);
    console.log(`Found ${commonInvestors.length} common investors`);
    
    console.log('Attempting to query institutional investors...');
    const institutionalInvestors = await db.select().from(schema.institutionalInvestors).limit(5);
    console.log(`Found ${institutionalInvestors.length} institutional investors`);
    
    console.log('✅ Real database connection is working!');
  } catch (error) {
    console.error('❌ Real database connection failed:', error);
  }
}

testRealDatabase();