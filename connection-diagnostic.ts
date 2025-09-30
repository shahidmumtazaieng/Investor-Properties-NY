import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

// Load environment variables
dotenv.config();

async function connectionDiagnostic() {
  console.log('=== DATABASE CONNECTION DIAGNOSTIC ===\n');
  
  // 1. Check environment variables
  console.log('1. Environment Variables Check:');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseDbUrl = process.env.SUPABASE_DATABASE_URL;
  const databaseUrl = process.env.DATABASE_URL;
  
  console.log('  SUPABASE_URL:', supabaseUrl ? '✓ SET' : '✗ MISSING');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ SET' : '✗ MISSING');
  console.log('  SUPABASE_DATABASE_URL:', supabaseDbUrl ? '✓ SET' : '✗ MISSING');
  console.log('  DATABASE_URL:', databaseUrl ? '✓ SET' : '✗ MISSING');
  console.log('');
  
  // 2. Test Supabase client connection
  console.log('2. Supabase Client Connection Test:');
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      console.log('  ✓ Supabase client created');
      
      // Test a simple operation
      const { data, error } = await supabase.from('users').select('count()', { count: 'exact' });
      if (error && error.code !== 'PGRST123') { // PGRST123 is expected for count queries
        console.log('  ✗ Supabase client test failed:', error.message);
      } else {
        console.log('  ✓ Supabase client connection working');
      }
    } catch (error) {
      console.log('  ✗ Supabase client creation failed:', error instanceof Error ? error.message : String(error));
    }
  } else {
    console.log('  ✗ Cannot test Supabase client - missing credentials');
  }
  console.log('');
  
  // 3. Test PostgreSQL connection
  console.log('3. PostgreSQL Connection Test:');
  const connectionString = supabaseDbUrl || databaseUrl;
  if (connectionString) {
    console.log('  Connection string found');
    console.log('  Connection string (masked):', connectionString.replace(/:[^:@/]+@/, ':****@'));
    
    try {
      console.log('  Attempting to connect...');
      const client = postgres(connectionString, { max: 1, timeout: 10000 });
      
      // Try a simple query
      const result = await client`SELECT version()`;
      console.log('  ✓ PostgreSQL connection successful');
      console.log('  PostgreSQL version:', result[0].version);
      
      await client.end();
    } catch (error) {
      console.log('  ✗ PostgreSQL connection failed:', error instanceof Error ? error.message : String(error));
      
      // Provide specific troubleshooting steps
      if (error instanceof Error) {
        if (error.message.includes('Tenant or user not found')) {
          console.log('    Troubleshooting steps:');
          console.log('    1. Verify your Supabase project is active');
          console.log('    2. Check if the database user exists');
          console.log('    3. Ensure the password is correct');
          console.log('    4. Try resetting your database password in Supabase dashboard');
        } else if (error.message.includes('authentication')) {
          console.log('    Troubleshooting steps:');
          console.log('    1. Double-check your database credentials');
          console.log('    2. Ensure special characters in password are properly encoded');
          console.log('    3. Try changing your password to something without special characters');
        } else if (error.message.includes('connect') || error.message.includes('ENOTFOUND')) {
          console.log('    Troubleshooting steps:');
          console.log('    1. Check your internet connection');
          console.log('    2. Verify the database host is correct');
          console.log('    3. Ensure your firewall allows outgoing connections on port 5432');
        }
      }
    }
  } else {
    console.log('  ✗ Cannot test PostgreSQL connection - no connection string found');
  }
  console.log('');
  
  // 4. Summary
  console.log('4. Summary:');
  console.log('  Environment variables:', supabaseUrl && supabaseKey && (supabaseDbUrl || databaseUrl) ? '✓ COMPLETE' : '✗ INCOMPLETE');
  console.log('');
  
  console.log('=== DATABASE CONNECTION DIAGNOSTIC COMPLETED ===');
}

// Run the diagnostic
connectionDiagnostic();