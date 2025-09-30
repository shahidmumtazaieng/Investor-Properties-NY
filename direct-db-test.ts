import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

async function testDirectDatabaseConnection() {
  console.log('=== DIRECT DATABASE CONNECTION TEST ===\n');
  
  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Missing Supabase configuration');
    return;
  }
  
  try {
    console.log('\n--- Creating Supabase client ---');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    
    console.log('\n--- Testing connection with a simple query ---');
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase query failed:', error.message);
      console.log('Error details:', error);
      return;
    }
    
    console.log('✅ Supabase connection test successful');
    console.log('Sample data:', data);
    
  } catch (error) {
    console.log('❌ Error creating Supabase client:', error instanceof Error ? error.message : String(error));
    return;
  }
  
  console.log('\n=== CONNECTION TEST COMPLETE ===');
}

testDirectDatabaseConnection().catch(console.error);