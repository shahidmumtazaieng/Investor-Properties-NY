import { DatabaseRepository } from './database-repository.ts';

async function testPartnerRegistration() {
  console.log('Testing partner registration functionality...');
  
  const db = new DatabaseRepository();
  
  // Test data for partner registration
  const testPartner = {
    username: 'testpartner_' + Date.now(),
    password: 'testpassword123',
    email: `testpartner_${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'Partner',
    company: 'Test Company',
    phone: '123-456-7890',
    isActive: true,
    approvalStatus: 'pending',
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  try {
    console.log('Creating test partner...');
    const partner = await db.createPartner(testPartner);
    console.log('Partner created successfully:', partner.id);
    
    // Test fetching the partner
    console.log('Fetching partner by ID...');
    const fetchedPartner = await db.getPartnerById(partner.id);
    console.log('Partner fetched successfully:', fetchedPartner?.username);
    
    // Test fetching by username
    console.log('Fetching partner by username...');
    const partnerByUsername = await db.getPartnerByUsername(testPartner.username);
    console.log('Partner fetched by username successfully:', partnerByUsername?.email);
    
    // Test updating partner
    console.log('Updating partner...');
    const updatedPartner = await db.updatePartner(partner.id, {
      company: 'Updated Test Company',
      updatedAt: new Date()
    });
    console.log('Partner updated successfully:', updatedPartner?.company);
    
    console.log('All tests passed!');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Run the test
testPartnerRegistration()
  .then(success => {
    if (success) {
      console.log('\n✅ Partner registration test completed successfully');
    } else {
      console.error('\n❌ Partner registration test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during test:', error);
    process.exit(1);
  });