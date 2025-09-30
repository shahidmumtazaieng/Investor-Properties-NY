import { DatabaseRepository } from './server/database-repository.ts';

async function testDbRepoMethods() {
  console.log('Testing database repository methods...\n');
  
  const db = new DatabaseRepository();
  
  try {
    console.log('1. Testing getPartnerByUsername with a non-existent user...');
    const nonExistentPartner = await db.getPartnerByUsername('nonexistentuser');
    console.log('Result:', nonExistentPartner);
    
    console.log('\n2. Testing createPartner method...');
    const testPartnerData = {
      username: 'testpartner_' + Date.now(),
      password: 'testpassword123',
      email: `testpartner_${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'Partner',
      company: 'Test Company',
      phone: '555-123-4567',
      isActive: true,
      approvalStatus: 'pending',
      emailVerified: false,
      phoneVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Creating partner with data:', JSON.stringify(testPartnerData, null, 2));
    const createdPartner = await db.createPartner(testPartnerData);
    console.log('Created partner:', createdPartner);
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testDbRepoMethods();