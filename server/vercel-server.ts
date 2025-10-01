import { app } from './index.ts';
import testVercelDB from './test-vercel-db.ts';

// Add a test endpoint for Vercel deployment verification
app.get('/api/test-vercel-db', testVercelDB);

// Export the Express app as the default export for Vercel
export default app;

// This file is specifically for Vercel deployment
// It exports the Express app without starting the server
// Vercel will handle the server initialization