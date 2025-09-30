import { DatabaseRepository } from './server/database-repository';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAnalyticsData() {
  console.log('=== TESTING ANALYTICS DATA WITH REAL DATA ===\n');
  
  const db = new DatabaseRepository();
  
  try {
    console.log('Fetching analytics data...');
    const analytics = await db.getAnalyticsData();
    
    console.log('Analytics Data:');
    console.log('- Total Users:', analytics.totalUsers);
    console.log('- Total Properties:', analytics.totalProperties);
    console.log('- Total Investors:', analytics.totalInvestors);
    console.log('- Total Sellers:', analytics.totalSellers);
    console.log('- Recent Activity Count:', analytics.recentActivity.length);
    console.log('- Revenue Data Points:', analytics.revenueData.length);
    
    console.log('\n✅ Analytics data test completed successfully');
    
  } catch (error) {
    console.error('❌ Error during analytics data test:', error);
  }
}

testAnalyticsData().catch(console.error);