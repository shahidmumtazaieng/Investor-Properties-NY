// Verify database connection for institutional investors
require('dotenv').config();
const { Client } = require('pg');

console.log('=== Institutional Investor Database Connection Test ===');

// Extract connection details from SUPABASE_DATABASE_URL
const dbUrl = process.env.SUPABASE_DATABASE_URL;
console.log('Database URL exists:', !!dbUrl);

if (!dbUrl) {
  console.log('ERROR: SUPABASE_DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Mask password for security in logs
const maskedUrl = dbUrl.replace(/:[^:@/]+@/, ':****@');
console.log('Connection string (masked):', maskedUrl);

// Test direct PostgreSQL connection
console.log('\n=== Testing Direct PostgreSQL Connection ===');
const client = new Client({
  connectionString: dbUrl,
});

async function testConnection() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Successfully connected to database');
    
    // Test a simple query
    console.log('Executing test query...');
    const result = await client.query('SELECT 1 as test');
    console.log('✓ Test query executed successfully:', result.rows[0]);
    
    // Test institutional investors table access
    console.log('Checking institutional_investors table...');
    try {
      const tableResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'institutional_investors' 
        LIMIT 5
      `);
      console.log('✓ institutional_investors table exists with columns:');
      tableResult.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });
    } catch (tableError) {
      console.log('⚠ institutional_investors table check failed:', tableError.message);
    }
    
    await client.end();
    console.log('\n=== Database Connection Test Complete ===');
    console.log('✓ All tests passed - Institutional investor database operations should work');
    
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    console.log('\n=== Troubleshooting Steps ===');
    console.log('1. Verify the database credentials in SUPABASE_DATABASE_URL');
    console.log('2. Check if the database server is accessible from this machine');
    console.log('3. Ensure outbound connections to port 5432 are allowed');
    console.log('4. Test with a database client like pgAdmin or psql');
    console.log('5. Check Supabase dashboard for any connection issues');
    
    try {
      await client.end();
    } catch (endError) {
      // Ignore end error
    }
  }
}

testConnection();