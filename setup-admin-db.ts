import { db } from './server/database.ts';
import { testDatabaseConnection } from './server/database.ts';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupAdminDatabase() {
  console.log('=== ADMIN DATABASE SETUP ===\n');
  
  // Check database connection
  console.log('Testing database connection...');
  const isConnected = await testDatabaseConnection();
  console.log('Database Connection Status:', isConnected ? 'SUCCESS' : 'FAILED');
  
  if (!isConnected) {
    console.log('\n❌ Database connection failed. Cannot proceed with setup.');
    return;
  }
  
  if (!db) {
    console.log('\n❌ Database instance not available. Cannot proceed with setup.');
    return;
  }
  
  console.log('\n✅ Database connection is working. Proceeding with setup...\n');
  
  try {
    // Check if admin_users table exists by attempting to query it
    console.log('Checking if admin_users table exists...');
    const result = await db.execute(sql`SELECT 1 FROM admin_users LIMIT 1`);
    console.log('✅ admin_users table exists');
  } catch (error) {
    console.log('❌ admin_users table does not exist or is not accessible');
    console.log('Error:', error instanceof Error ? error.message : String(error));
    
    // Try to create the table
    console.log('\nAttempting to create admin_users table...');
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS admin_users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ admin_users table created successfully');
    } catch (createError) {
      console.log('❌ Failed to create admin_users table');
      console.log('Error:', createError instanceof Error ? createError.message : String(createError));
      return;
    }
  }
  
  // Check if there are any admin users
  try {
    console.log('\nChecking for existing admin users...');
    const adminUsers = await db.execute(sql`SELECT COUNT(*) as count FROM admin_users`);
    const count = parseInt(adminUsers[0].count as string);
    console.log(`Found ${count} admin users in the database`);
    
    if (count === 0) {
      console.log('\nNo admin users found. You may want to create one using the create-admin script.');
    }
  } catch (error) {
    console.log('❌ Error checking admin users:', error instanceof Error ? error.message : String(error));
  }
  
  console.log('\n=== SETUP COMPLETE ===');
  console.log('\nTo manage users in the admin panel:');
  console.log('1. Make sure FORCE_DEMO_MODE is not set to true in your .env file');
  console.log('2. Ensure your database connection is properly configured');
  console.log('3. Start the server with: npm run dev');
  console.log('4. Access the admin panel and navigate to User Management');
}

setupAdminDatabase().catch(console.error);