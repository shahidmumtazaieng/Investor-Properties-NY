import { DatabaseRepository } from './server/database-repository.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAdminAuth() {
  console.log('Testing admin authentication...');
  
  try {
    const db = new DatabaseRepository();
    console.log('Database repository initialized');
    
    // Test 1: Try to authenticate with testadmin/testpassword
    console.log('\n--- Test 1: Authenticating with testadmin/testpassword ---');
    const admin1 = await db.authenticateAdmin('testadmin', 'testpassword');
    if (admin1) {
      console.log('✓ Authentication successful for testadmin');
      console.log('  User:', {
        id: admin1.id,
        username: admin1.username,
        email: admin1.email
      });
    } else {
      console.log('✗ Authentication failed for testadmin');
    }
    
    // Test 2: Try to authenticate with admin/password
    console.log('\n--- Test 2: Authenticating with admin/password ---');
    const admin2 = await db.authenticateAdmin('admin', 'password');
    if (admin2) {
      console.log('✓ Authentication successful for admin');
      console.log('  User:', {
        id: admin2.id,
        username: admin2.username,
        email: admin2.email
      });
    } else {
      console.log('✗ Authentication failed for admin');
    }
    
    // Test 3: Try with invalid credentials
    console.log('\n--- Test 3: Authenticating with invalid credentials ---');
    const invalidAdmin = await db.authenticateAdmin('invalid', 'invalid');
    if (invalidAdmin) {
      console.log('✗ Unexpected authentication success for invalid user');
    } else {
      console.log('✓ Authentication correctly failed for invalid user');
    }
    
    console.log('\n=== Admin Authentication Test Completed ===');
    
  } catch (error) {
    console.error('Error during admin authentication test:', error);
  }
}

testAdminAuth();