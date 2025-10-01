import { databaseHealthCheck } from './database.ts';

// Simple test function for Vercel deployment verification
export default async function testVercelDB(req: any, res: any) {
  try {
    console.log('Starting Vercel DB test...');
    
    // Test database health
    const health = await databaseHealthCheck();
    
    console.log('Database health check result:', health);
    
    res.status(200).json({
      success: true,
      message: 'Vercel DB test completed',
      database: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Vercel DB test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Vercel DB test failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}

// For direct export in Vercel
export const config = {
  api: {
    bodyParser: true,
  },
};