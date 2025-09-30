// Simple test to check environment variables
require('dotenv').config();

console.log('Environment Variables Check:');
console.log('- FORCE_DEMO_MODE:', process.env.FORCE_DEMO_MODE || 'not set (good)');
console.log('- SUPABASE_DATABASE_URL exists:', !!process.env.SUPABASE_DATABASE_URL);
console.log('- SUPABASE_URL exists:', !!process.env.SUPABASE_URL);

if (process.env.SUPABASE_DATABASE_URL) {
  console.log('- Database URL (masked):', process.env.SUPABASE_DATABASE_URL.replace(/:[^:@/]+@/, ':****@'));
}

console.log('\nTo activate real institutional investor capabilities:');
console.log('1. Ensure FORCE_DEMO_MODE is not set to true in .env');
console.log('2. Verify database credentials in SUPABASE_DATABASE_URL are correct');
console.log('3. Check that the database server is accessible');
console.log('4. Restart the application after any configuration changes');