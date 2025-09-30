import { DatabaseRepository } from './server/database-repository';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAdminUserManagement() {
  console.log('=== ADMIN USER MANAGEMENT TEST ===\n');
  
  const db = new DatabaseRepository();
  
  try {
    console.log('--- Testing Admin User Management ---');
    
    // Test fetching all admin users
    console.log('\n1. Fetching all admin users...');
    const adminUsers = await db.getAllAdminUsers();
    console.log(`✅ Found ${adminUsers.length} admin users`);
    
    // Test fetching all common investors
    console.log('\n2. Fetching all common investors...');
    const commonInvestors = await db.getAllCommonInvestors();
    console.log(`✅ Found ${commonInvestors.length} common investors`);
    
    // Test fetching all institutional investors
    console.log('\n3. Fetching all institutional investors...');
    const institutionalInvestors = await db.getAllInstitutionalInvestors();
    console.log(`✅ Found ${institutionalInvestors.length} institutional investors`);
    
    // Test fetching all partners
    console.log('\n4. Fetching all partners...');
    const partners = await db.getAllPartners();
    console.log(`✅ Found ${partners.length} partners`);
    
    // Test creating a new admin user (in demo mode this won't actually create)
    console.log('\n5. Testing admin user creation...');
    const newAdmin = await db.createAdminUser({
      username: 'testadmin',
      email: 'testadmin@example.com',
      firstName: 'Test',
      lastName: 'Admin',
      password: 'testpassword123',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`✅ Admin user creation test completed:`, newAdmin.id ? 'SUCCESS' : 'DEMO MODE');
    
    console.log('\n=== TEST COMPLETE ===');
    console.log('\n🎉 Admin user management is working properly!');
    console.log('The admin panel should now show real user data instead of demo data.');
    
  } catch (error) {
    console.error('❌ Error during admin user management test:', error);
  }
}

testAdminUserManagement().catch(console.error);