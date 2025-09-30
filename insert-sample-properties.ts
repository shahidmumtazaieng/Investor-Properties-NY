// Script to insert sample property data directly using Supabase client
import { supabase } from './server/database.ts';

async function insertSampleProperties() {
  console.log('=== INSERTING SAMPLE PROPERTY DATA ===\n');
  
  try {
    // Test Supabase connection first
    console.log('1. Testing Supabase connection...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful\n');
    
    // Check if properties table exists by querying it
    console.log('2. Checking if properties table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Properties table access failed:', tableError.message);
      return;
    }
    
    console.log('✅ Properties table exists and is accessible\n');
    
    // Insert sample properties
    console.log('3. Inserting sample properties...');
    
    const sampleProperties = [
      {
        address: '123 Main Street',
        neighborhood: 'Downtown',
        borough: 'Manhattan',
        property_type: 'Single Family',
        beds: 3,
        baths: 2.5,
        sqft: 1800,
        price: 750000,
        arv: 850000,
        estimated_profit: 75000,
        cap_rate: 8.5,
        annual_income: 45000,
        condition: 'Good',
        access: 'Available with Appointment',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'],
        description: 'Beautiful modern home with updated kitchen and spacious backyard. Located in the heart of downtown Manhattan with easy access to public transportation.',
        source: 'internal',
        status: 'available',
        is_active: true
      },
      {
        address: '456 Park Avenue',
        neighborhood: 'Midtown',
        borough: 'Manhattan',
        property_type: 'Condo',
        beds: 2,
        baths: 2,
        sqft: 1200,
        price: 650000,
        arv: 720000,
        estimated_profit: 60000,
        cap_rate: 9.2,
        annual_income: 52000,
        condition: 'Excellent',
        access: 'Available with Appointment',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'],
        description: 'Luxury condo with city views and premium amenities. Features high-end finishes, granite countertops, and stainless steel appliances.',
        source: 'internal',
        status: 'available',
        is_active: true
      },
      {
        address: '789 Broadway',
        neighborhood: 'Flatiron',
        borough: 'Manhattan',
        property_type: 'Multi-Family',
        beds: 6,
        baths: 4,
        sqft: 3200,
        price: 1200000,
        arv: 1400000,
        estimated_profit: 150000,
        cap_rate: 12.5,
        annual_income: 120000,
        condition: 'Fair',
        access: 'Available with Appointment',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'],
        description: 'Investment property with multiple rental units. Great opportunity for investors looking to generate passive income.',
        source: 'internal',
        status: 'available',
        is_active: true
      }
    ];
    
    // Insert the property data
    const { data: insertedProperties, error: insertError } = await supabase
      .from('properties')
      .insert(sampleProperties)
      .select();
    
    if (insertError) {
      console.log('❌ Failed to insert sample properties:', insertError.message);
      return;
    }
    
    console.log(`✅ Successfully inserted ${insertedProperties.length} sample properties`);
    
    // Display the inserted property addresses
    insertedProperties.forEach((property: any, index: number) => {
      console.log(`${index + 1}. "${property.address}" (ID: ${property.id})`);
    });
    
    console.log('\n=== SAMPLE PROPERTY INSERTION COMPLETE ===');
    console.log('✅ Property management system is now activated with real database operations');
    
  } catch (error) {
    console.error('❌ Error during property insertion:', error);
  }
}

// Run the insertion
insertSampleProperties();