import { DatabaseRepository } from './server/database-repository';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDashboardStats() {
  console.log('=== TESTING DASHBOARD STATS WITH REAL DATA ===\n');
  
  const db = new DatabaseRepository();
  
  try {
    console.log('Fetching dashboard stats...');
    const stats = await db.getDashboardStats();
    
    console.log('Dashboard Stats:');
    console.log('- Total Users:', stats.totalUsers);
    console.log('- Pending Approvals:', stats.pendingApprovals);
    console.log('- Active Properties:', stats.activeProperties);
    console.log('- Total Revenue: $', stats.totalRevenue.toLocaleString());
    
    console.log('\n✅ Dashboard stats test completed successfully');
    
  } catch (error) {
    console.error('❌ Error during dashboard stats test:', error);
  }
}

testDashboardStats().catch(console.error);