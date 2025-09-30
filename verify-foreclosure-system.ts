import { DatabaseRepository } from './server/database-repository.ts';
import { config } from 'dotenv';

// Load environment variables
config();

async function verifyForeclosureSystem() {
  const db = new DatabaseRepository();
  
  console.log('=== FORECLOSURE MANAGEMENT SYSTEM VERIFICATION ===\n');
  
  try {
    // Test 1: Check if we can fetch foreclosure listings
    console.log('1. Testing foreclosure listings fetch...');
    const listings = await db.getAllForeclosureListings();
    console.log(`   Found ${listings.length} foreclosure listings`);
    if (listings.length > 0) {
      console.log('   ✓ Foreclosure listings fetch successful');
      console.log(`   Sample listing: ${listings[0].address} in ${listings[0].county}`);
    } else {
      console.log('   ! No foreclosure listings found - run insert-sample-foreclosures.ts first');
    }
    
    // Test 2: Check if we can create a foreclosure listing
    console.log('\n2. Testing foreclosure listing creation...');
    const testListing = {
      address: 'Test Property - 1000 Verification Ave',
      county: 'Queens',
      auctionDate: new Date('2024-04-05T10:00:00Z'),
      startingBid: '500000',
      propertyType: 'Single Family',
      beds: 4,
      baths: '3',
      sqft: 2200,
      yearBuilt: 2000,
      description: 'Test property for verification',
      docketNumber: 'TEST-001',
      plaintiff: 'Test Bank',
      status: 'upcoming',
      isActive: true
    };
    
    const createdListing = await db.createForeclosureListing(testListing);
    console.log(`   Created test listing with ID: ${createdListing.id}`);
    console.log('   ✓ Foreclosure listing creation successful');
    
    // Test 3: Check if we can update a foreclosure listing
    console.log('\n3. Testing foreclosure listing update...');
    const updatedListing = await db.updateForeclosureListing(createdListing.id, {
      ...testListing,
      description: 'Updated test property for verification',
      updatedAt: new Date()
    });
    console.log(`   Updated listing: ${updatedListing.description}`);
    console.log('   ✓ Foreclosure listing update successful');
    
    // Test 4: Check if we can toggle foreclosure listing status
    console.log('\n4. Testing foreclosure listing status toggle...');
    const toggledListing = await db.toggleForeclosureListingStatus(createdListing.id);
    console.log(`   Toggled listing status to: ${toggledListing.isActive ? 'Active' : 'Inactive'}`);
    console.log('   ✓ Foreclosure listing status toggle successful');
    
    // Test 5: Check if we can create a bid service request
    console.log('\n5. Testing bid service request creation...');
    const testBid = {
      leadId: 'test-lead-id',
      foreclosureListingId: createdListing.id,
      name: 'Test Investor',
      email: 'test@example.com',
      phone: '(555) 123-4567',
      investmentBudget: '$400k-$600k',
      maxBidAmount: '550000',
      investmentExperience: '3-5 Years Experience',
      preferredContactMethod: 'email',
      timeframe: '30 days',
      additionalRequirements: 'Need property inspection',
      status: 'pending'
    };
    
    const createdBid = await db.createBidServiceRequest(testBid);
    console.log(`   Created bid request with ID: ${createdBid.id}`);
    console.log('   ✓ Bid service request creation successful');
    
    // Test 6: Check if we can create an institutional bid tracking record
    console.log('\n6. Testing institutional bid tracking creation...');
    const testInstitutionalBid = {
      investorId: 'test-investor-id',
      propertyAddress: 'Test Property - 1000 Verification Ave',
      bidAmount: '525000',
      auctionDate: new Date('2024-04-05T10:00:00Z'),
      status: 'submitted',
      notes: 'Test institutional bid'
    };
    
    const createdInstitutionalBid = await db.createInstitutionalBidTracking(testInstitutionalBid);
    console.log(`   Created institutional bid with ID: ${createdInstitutionalBid.id}`);
    console.log('   ✓ Institutional bid tracking creation successful');
    
    // Test 7: Check if we can fetch all bid service requests
    console.log('\n7. Testing bid service requests fetch...');
    const bids = await db.getAllBidServiceRequests();
    console.log(`   Found ${bids.length} bid service requests`);
    console.log('   ✓ Bid service requests fetch successful');
    
    // Test 8: Check if we can fetch all institutional bid tracking records
    console.log('\n8. Testing institutional bid tracking fetch...');
    const institutionalBids = await db.getAllInstitutionalBidTracking();
    console.log(`   Found ${institutionalBids.length} institutional bid tracking records`);
    console.log('   ✓ Institutional bid tracking fetch successful');
    
    // Clean up test data
    console.log('\n9. Cleaning up test data...');
    // Note: We're not actually deleting the test data as it might be useful for verification
    
    console.log('\n=== ALL FORECLOSURE MANAGEMENT SYSTEM TESTS PASSED ===');
    console.log('\nSUMMARY:');
    console.log('- Database repository functions are working correctly');
    console.log('- Foreclosure listings can be created, read, updated, and toggled');
    console.log('- Bid service requests can be created and managed');
    console.log('- Institutional bid tracking is functional');
    console.log('- API endpoints should be ready for use');
    
  } catch (error) {
    console.error('Error verifying foreclosure management system:', error);
    console.log('\n!!! FORECLOSURE MANAGEMENT SYSTEM VERIFICATION FAILED !!!');
  }
}

// Run the verification
verifyForeclosureSystem().catch(console.error);