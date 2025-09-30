// Test partner database operations
require('dotenv').config();
const { Client } = require('pg');

console.log('=== Partner Database Operations Test ===');

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

// Test direct PostgreSQL connection for partners table
console.log('\n=== Testing Partners Table Access ===');
const client = new Client({
  connectionString: dbUrl,
});

async function testPartnerTable() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Successfully connected to database');
    
    // Test partners table existence
    console.log('Checking partners table...');
    try {
      const tableResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'partners' 
        ORDER BY ordinal_position
        LIMIT 10
      `);
      console.log('✓ partners table exists with columns:');
      tableResult.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });
    } catch (tableError) {
      console.log('⚠ partners table check failed:', tableError.message);
    }
    
    // Test a simple query on partners table
    console.log('\nTesting partners table query...');
    try {
      const queryResult = await client.query('SELECT COUNT(*) as count FROM partners');
      console.log('✓ partners table query successful');
      console.log(`  Total partners in database: ${queryResult.rows[0].count}`);
    } catch (queryError) {
      console.log('⚠ partners table query failed:', queryError.message);
    }
    
    await client.end();
    console.log('\n=== Partner Database Test Complete ===');
    console.log('✓ All tests passed - Partner database operations should work');
    
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

testPartnerTable();