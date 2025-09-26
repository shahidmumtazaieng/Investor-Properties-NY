const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Required tables for the application
const requiredTables = [
  'users',
  'properties',
  'foreclosure_listings',
  'subscriptions',
  'offers',
  'common_investors',
  'institutional_investors',
  'partners'
];

// Function to check if a table exists
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error checking table ${tableName}:`, error.message);
      return false;
    }
    
    console.log(`✅ Table ${tableName} exists`);
    return true;
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error);
    return false;
  }
}

// Main function to test database connection
async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count()', { count: 'exact' });
    
    if (error) {
      console.error('Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Check all required tables
    console.log('\nChecking required tables:');
    const tableResults = await Promise.all(
      requiredTables.map(table => checkTableExists(table))
    );
    
    const missingTables = requiredTables.filter((_, index) => !tableResults[index]);
    
    if (missingTables.length > 0) {
      console.error('\n❌ Missing tables:', missingTables.join(', '));
      console.log('\nPlease create the missing tables before proceeding.');
      return false;
    }
    
    console.log('\n✅ All required tables exist');
    return true;
    
  } catch (error) {
    console.error('Error testing database connection:', error);
    return false;
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\nDatabase connection test completed successfully');
    } else {
      console.error('\nDatabase connection test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during database test:', error);
    process.exit(1);
  });