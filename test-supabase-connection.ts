import { supabase } from './server/database.ts';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test a simple query
    console.log('Attempting to query admin users via Supabase...');
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase query failed:', error);
      return;
    }
    
    console.log('Supabase query successful!');
    console.log('Data:', data);
  } catch (error) {
    console.error('Supabase connection failed:', error);
  }
}

testSupabaseConnection();