import { DatabaseRepository } from './server/database-repository.ts';

async function testDatabaseRepository() {
  console.log('Testing database repository...');
  
  try {
    const db = new DatabaseRepository();
    console.log('Database repository initialized');
    
    // Test admin authentication with demo credentials
    console.log('Testing admin authentication with admin/admin123...');
    const admin = await db.authenticateAdmin('admin', 'admin123');
    console.log('Admin authentication result:', admin);
    
    // Test admin authentication with test credentials
    console.log('Testing admin authentication with testadmin/testpassword...');
    const testAdmin = await db.authenticateAdmin('testadmin', 'testpassword');
    console.log('Test admin authentication result:', testAdmin);
    
  } catch (error) {
    console.error('Error testing database repository:', error);
  }
}

testDatabaseRepository();