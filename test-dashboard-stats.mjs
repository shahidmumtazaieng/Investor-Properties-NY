import { DatabaseRepository } from './server/database-repository.ts';

async function testDashboardStats() {
  console.log('Testing dashboard stats...');
  
  const db = new DatabaseRepository();
  const stats = await db.getDashboardStats();
  
  console.log('Dashboard Stats:', stats);
}

testDashboardStats().catch(console.error);