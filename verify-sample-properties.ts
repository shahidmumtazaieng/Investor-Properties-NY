// Script to verify that sample property data can be fetched from the database
import { supabase } from './server/database.ts';

async function verifySampleProperties() {
  console.log('=== VERIFYING SAMPLE PROPERTY DATA ===\n');
  
  try {
    // Fetch all properties
    console.log('1. Fetching all properties...');
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Failed to fetch properties:', error.message);
      return;
    }
    
    console.log(`✅ Successfully fetched ${properties.length} properties`);
    
    // Display property information
    properties.forEach((property: any, index: number) => {
      console.log(`\n${index + 1}. ${property.address}`);
      console.log(`   Neighborhood: ${property.neighborhood}`);
      console.log(`   Borough: ${property.borough}`);
      console.log(`   Property Type: ${property.property_type}`);
      console.log(`   Price: $${property.price?.toLocaleString()}`);
      console.log(`   Beds: ${property.beds}`);
      console.log(`   Baths: ${property.baths}`);
      console.log(`   Sq Ft: ${property.sqft?.toLocaleString()}`);
      console.log(`   Status: ${property.status}`);
      console.log(`   Active: ${property.is_active ? 'Yes' : 'No'}`);
      console.log(`   Created: ${new Date(property.created_at).toLocaleDateString()}`);
    });
    
    // Test fetching a specific property by ID
    if (properties.length > 0) {
      console.log('\n2. Testing specific property fetch by ID...');
      const firstProperty = properties[0];
      const { data: specificProperty, error: specificError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', firstProperty.id)
        .single();
      
      if (specificError) {
        console.log('❌ Failed to fetch specific property:', specificError.message);
        return;
      }
      
      console.log('✅ Successfully fetched specific property by ID');
      console.log(`   Address: ${specificProperty.address}`);
      console.log(`   Price: $${specificProperty.price?.toLocaleString()}`);
      console.log(`   Description: ${specificProperty.description?.substring(0, 50)}...`);
    }
    
    // Test fetching active properties
    console.log('\n3. Testing active properties fetch...');
    const { data: activeProperties, error: activeError } = await supabase
      .from('properties')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (activeError) {
      console.log('❌ Failed to fetch active properties:', activeError.message);
      return;
    }
    
    console.log(`✅ Successfully fetched ${activeProperties.length} active properties`);
    
    // Test fetching properties by borough
    console.log('\n4. Testing properties by borough fetch...');
    const { data: manhattanProperties, error: boroughError } = await supabase
      .from('properties')
      .select('*')
      .eq('borough', 'Manhattan')
      .order('created_at', { ascending: false });
    
    if (boroughError) {
      console.log('❌ Failed to fetch Manhattan properties:', boroughError.message);
      return;
    }
    
    console.log(`✅ Successfully fetched ${manhattanProperties.length} Manhattan properties`);
    
    console.log('\n=== PROPERTY DATA VERIFICATION COMPLETE ===');
    console.log('✅ Property data can be successfully fetched from the database');
    console.log('✅ Property management system is fully operational with real database');
    
  } catch (error) {
    console.error('❌ Error during property data verification:', error);
  }
}

// Run the verification
verifySampleProperties();