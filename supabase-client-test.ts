import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

async function testSupabaseClient() {
  console.log('=== SUPABASE CLIENT TEST ===\n');
  
  // Get the Supabase credentials
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('✗ Missing Supabase credentials');
    console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Not set');
    return;
  }
  
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key:', supabaseKey ? 'Set (length: ' + supabaseKey.length + ')' : 'Not set');
  console.log('');
  
  try {
    console.log('Creating Supabase client...');
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    
    console.log('✓ Supabase client created successfully');
    
    // Try to fetch data from a table (using a simple query)
    console.log('Testing connection with a simple query...');
    
    // Try to get a few rows from users table (if it exists)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Query error:', error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', error.details);
      
      // Try another table that might exist
      console.log('\nTrying with admin_users table...');
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1);
      
      if (adminError) {
        console.log('Admin users query error:', adminError.message);
      } else {
        console.log('✓ Admin users query successful!');
        console.log('Found', adminData?.length || 0, 'admin users');
      }
    } else {
      console.log('✓ Users query successful!');
      console.log('Found', data?.length || 0, 'users');
    }
    
  } catch (error) {
    console.log('✗ Supabase client test failed:');
    console.log('Error:', error instanceof Error ? error.message : String(error));
  }
  
  console.log('\n=== SUPABASE CLIENT TEST COMPLETED ===');
}

// Run the test
testSupabaseClient();