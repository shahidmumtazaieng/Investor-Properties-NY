import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPartnerRegistration() {
  console.log('Testing partner registration functionality...');
  
  // Test data for partner registration
  const testPartner = {
    username: 'testpartner_' + Date.now(),
    password: 'testpassword123',
    email: `testpartner_${Date.now()}@example.com`,
    first_name: 'Test',
    last_name: 'Partner',
    company: 'Test Company',
    phone: '123-456-7890',
    is_active: true,
    approval_status: 'pending',
    email_verified: false,
    phone_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(testPartner.password, 10);
    const partnerData = {
      ...testPartner,
      password: hashedPassword
    };
    
    console.log('Creating test partner...');
    const { data, error } = await supabase
      .from('partners')
      .insert(partnerData)
      .select()
      .single();
    
    if (error) {
      console.error('Partner creation failed:', error.message);
      return false;
    }
    
    console.log('Partner created successfully:', data.id);
    
    // Test fetching the partner
    console.log('Fetching partner by ID...');
    const { data: fetchedPartner, error: fetchError } = await supabase
      .from('partners')
      .select('*')
      .eq('id', data.id)
      .single();
    
    if (fetchError) {
      console.error('Fetching partner failed:', fetchError.message);
      return false;
    }
    
    console.log('Partner fetched successfully:', fetchedPartner.username);
    
    // Test updating partner
    console.log('Updating partner...');
    const { data: updatedPartner, error: updateError } = await supabase
      .from('partners')
      .update({ 
        company: 'Updated Test Company',
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Updating partner failed:', updateError.message);
      return false;
    }
    
    console.log('Partner updated successfully:', updatedPartner.company);
    
    console.log('All tests passed!');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Run the test
testPartnerRegistration()
  .then(success => {
    if (success) {
      console.log('\n✅ Partner registration test completed successfully');
    } else {
      console.error('\n❌ Partner registration test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during test:', error);
    process.exit(1);
  });