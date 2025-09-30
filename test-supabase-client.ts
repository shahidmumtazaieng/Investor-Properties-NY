import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

async function testSupabaseClient() {
  console.log('Testing Supabase client connection...\n');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('Missing Supabase credentials');
    return;
  }
  
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Supabase client created successfully');
    
    // Try a simple query
    console.log('Testing connection with a simple query...');
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Query failed:', error);
    } else {
      console.log('Query successful! Found', data.length, 'partners');
    }
    
  } catch (error) {
    console.error('Supabase client test failed:', error);
  }
}

testSupabaseClient();