import { DatabaseRepository } from './database-repository.ts';

async function testAdminAuth() {
  const db = new DatabaseRepository();
  
  try {
    console.log('Testing admin authentication...');
    
    // Test authentication with demo credentials
    const admin = await db.authenticateAdmin('admin', 'admin123');
    console.log('Admin authentication result:', admin);
    
    if (admin) {
      console.log('Admin authentication successful!');
      
      // Test creating a session
      const sessionToken = db.generateSessionToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      console.log('Creating admin session...');
      await db.createAdminSession(admin.id, sessionToken, expiresAt);
      console.log('Admin session created successfully!');
      
      // Test retrieving the session
      const session = await db.getAdminSession(sessionToken);
      console.log('Retrieved session:', session);
      
      // Test deleting the session
      console.log('Deleting admin session...');
      await db.deleteAdminSession(sessionToken);
      console.log('Admin session deleted successfully!');
    } else {
      console.log('Admin authentication failed!');
    }
  } catch (error) {
    console.error('Error testing admin authentication:', error);
  }
}

testAdminAuth();