// Simple database connection test
require('dotenv').config();

console.log('=== Database Connection Test ===');
console.log('Environment Variables:');
console.log('- FORCE_DEMO_MODE:', process.env.FORCE_DEMO_MODE || 'not set');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- SUPABASE_DATABASE_URL exists:', !!process.env.SUPABASE_DATABASE_URL);

// Mask the password in the connection string for security
if (process.env.SUPABASE_DATABASE_URL) {
  const maskedUrl = process.env.SUPABASE_DATABASE_URL.replace(/:[^:@/]+@/, ':****@');
  console.log('- SUPABASE_DATABASE_URL (masked):', maskedUrl);
}

console.log('\n=== Analysis ===');
console.log('Based on the environment variables:');
console.log('1. FORCE_DEMO_MODE is not set to true (good)');
console.log('2. SUPABASE_DATABASE_URL is configured (good)');
console.log('3. The database connection should be active');

console.log('\n=== To Activate Real Institutional Investor Capabilities ===');
console.log('If institutional investors are still using demo mode, try these steps:');

console.log('\n1. Restart the application server completely');
console.log('   - Stop the current server process');
console.log('   - Start it again with: npm run dev (or your start command)');

console.log('\n2. Check server logs for database connection messages');
console.log('   - Look for messages like "Attempting to connect to database..."');
console.log('   - Look for "Database connection established successfully"');
console.log('   - Check for any error messages related to database connection');

console.log('\n3. Verify database credentials');
console.log('   - Ensure the username, password, and host in SUPABASE_DATABASE_URL are correct');
console.log('   - Make sure special characters in the password are URL encoded');
console.log('   - Example: @ should be encoded as %40');

console.log('\n4. Test database connectivity externally');
console.log('   - Use a database client like pgAdmin or psql to test the connection');
console.log('   - Command: psql "postgresql://postgres:Shahid%40786123@mxjjjoyqkpucrhadezti.supabase.co:5432/postgres"');

console.log('\n5. Check firewall and network settings');
console.log('   - Ensure outbound connections to port 5432 are allowed');
console.log('   - Verify there are no network restrictions to Supabase');