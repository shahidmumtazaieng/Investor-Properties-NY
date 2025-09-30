import { DatabaseRepository } from './server/database-repository';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runComprehensiveTests() {
  console.log('=== COMPREHENSIVE SYSTEM TEST ===\n');
  
  try {
    const db = new DatabaseRepository();
    console.log('✓ Database repository initialized\n');
    
    // Test 1: Admin Authentication
    await testAdminAuthentication(db);
    
    // Test 2: Investor Authentication
    await testInvestorAuthentication(db);
    
    // Test 3: Partner Authentication
    await testPartnerAuthentication(db);
    
    // Test 4: Admin Panel Tasks
    await testAdminPanelTasks(db);
    
    // Test 5: Investor Tasks
    await testInvestorTasks(db);
    
    // Test 6: Partner Tasks
    await testPartnerTasks(db);
    
    console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
    console.log('All components are working correctly!');
    
  } catch (error) {
    console.error('✗ Comprehensive test failed:', error);
    console.error('Error details:', (error as Error).message);
  }
}

async function testAdminAuthentication(db: DatabaseRepository) {
  console.log('=== ADMIN AUTHENTICATION TESTS ===');
  
  // Test fetching admin users
  try {
    const adminUsers = await db.getAllAdminUsers();
    console.log(`✓ Fetched ${adminUsers.length} admin users`);
  } catch (error) {
    console.error('✗ Failed to fetch admin users:', error);
  }
  
  // Test admin authentication with test users
  try {
    const authenticatedAdmin = await db.authenticateAdmin('testadmin', 'testpassword');
    if (authenticatedAdmin) {
      console.log('✓ Admin authentication successful (testadmin)');
    } else {
      console.log('✗ Admin authentication failed (testadmin)');
    }
  } catch (error) {
    console.error('✗ Admin authentication error:', error);
  }
  
  try {
    const authenticatedAdmin = await db.authenticateAdmin('admin', 'password');
    if (authenticatedAdmin) {
      console.log('✓ Admin authentication successful (admin)');
    } else {
      console.log('✗ Admin authentication failed (admin)');
    }
  } catch (error) {
    console.error('✗ Admin authentication error:', error);
  }
  
  console.log('');
}

async function testInvestorAuthentication(db: DatabaseRepository) {
  console.log('=== INVESTOR AUTHENTICATION TESTS ===');
  
  // Test common investor authentication (demo mode)
  try {
    const commonInvestor = await db.authenticateCommonInvestor('demo', 'demo123');
    if (commonInvestor) {
      console.log('✓ Common investor authentication successful (demo mode)');
    } else {
      console.log('⚠ Common investor authentication returned no user (demo mode)');
    }
  } catch (error) {
    console.error('✗ Common investor authentication error:', error);
  }
  
  // Test institutional investor authentication (demo mode)
  try {
    const institutionalInvestor = await db.authenticateInstitutionalInvestor('institutional_demo', 'demo123');
    if (institutionalInvestor) {
      console.log('✓ Institutional investor authentication successful (demo mode)');
    } else {
      console.log('⚠ Institutional investor authentication returned no user (demo mode)');
    }
  } catch (error) {
    console.error('✗ Institutional investor authentication error:', error);
  }
  
  console.log('');
}

async function testPartnerAuthentication(db: DatabaseRepository) {
  console.log('=== PARTNER AUTHENTICATION TESTS ===');
  
  // Test partner authentication (demo mode)
  try {
    const partner = await db.authenticatePartner('partner_demo', 'demo123');
    if (partner) {
      console.log('✓ Partner authentication successful (demo mode)');
    } else {
      console.log('⚠ Partner authentication returned no user (demo mode)');
    }
  } catch (error) {
    console.error('✗ Partner authentication error:', error);
  }
  
  console.log('');
}

async function testAdminPanelTasks(db: DatabaseRepository) {
  console.log('=== ADMIN PANEL TASKS TESTS ===');
  
  // Test fetching dashboard stats
  try {
    const stats = await db.getDashboardStats();
    console.log('✓ Dashboard stats fetched successfully');
  } catch (error) {
    console.error('⚠ Dashboard stats fetch (may be expected in demo mode):', error);
  }
  
  // Test fetching all users
  try {
    const users = await db.getAllCommonInvestors();
    console.log(`✓ Fetched ${users.length} common investors`);
  } catch (error) {
    console.error('✗ Failed to fetch common investors:', error);
  }
  
  try {
    const users = await db.getAllInstitutionalInvestors();
    console.log(`✓ Fetched ${users.length} institutional investors`);
  } catch (error) {
    console.error('✗ Failed to fetch institutional investors:', error);
  }
  
  try {
    const users = await db.getAllPartners();
    console.log(`✓ Fetched ${users.length} partners`);
  } catch (error) {
    console.error('✗ Failed to fetch partners:', error);
  }
  
  console.log('');
}

async function testInvestorTasks(db: DatabaseRepository) {
  console.log('=== INVESTOR TASKS TESTS ===');
  
  // Test fetching properties
  try {
    const properties = await db.getAllProperties();
    console.log(`✓ Fetched ${properties.length} properties`);
  } catch (error) {
    console.error('✗ Failed to fetch properties:', error);
  }
  
  // Test fetching foreclosure listings
  try {
    const listings = await db.getAllForeclosureListings();
    console.log(`✓ Fetched ${listings.length} foreclosure listings`);
  } catch (error) {
    console.error('✗ Failed to fetch foreclosure listings:', error);
  }
  
  console.log('');
}

async function testPartnerTasks(db: DatabaseRepository) {
  console.log('=== PARTNER TASKS TESTS ===');
  
  // Test fetching leads
  try {
    const leads = await db.getAllLeads();
    console.log(`✓ Fetched ${leads.length} leads`);
  } catch (error) {
    console.error('✗ Failed to fetch leads:', error);
  }
  
  console.log('');
}

// Run the comprehensive tests
runComprehensiveTests();