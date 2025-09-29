import { DatabaseRepository } from './server/database-repository.ts';

async function testEmailCampaigns() {
  console.log('Testing email campaigns...');
  
  const db = new DatabaseRepository();
  const campaigns = await db.getAllEmailCampaigns();
  
  console.log('Email Campaigns:', campaigns);
}

testEmailCampaigns().catch(console.error);