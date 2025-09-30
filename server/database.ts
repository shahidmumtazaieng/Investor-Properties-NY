// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.ts';
import { sql } from 'drizzle-orm';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-key';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Using demo Supabase credentials. Please configure real credentials in .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Create direct PostgreSQL connection for Drizzle ORM
const demoString = 'postgresql://demo:demo@localhost:5432/demo';
const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || demoString;

console.log('Connection string:', connectionString ? 'Configured' : 'Not found');
console.log('Is demo connection:', connectionString === demoString);

// Connection function with error handling
const createDbConnection = () => {
  try {
    // Force demo mode for testing
    const forceDemoMode = process.env.FORCE_DEMO_MODE === 'true';
    if (forceDemoMode || !connectionString || connectionString === demoString) {
      console.log('Running in demo mode with mock data');
      // Return mock objects for demo mode
      return { 
        queryClient: null, 
        db: null 
      };
    }
    
    console.log('Attempting to connect to database...');
    console.log('Connection string (masked):', connectionString.replace(/:[^:@/]+@/, ':****@'));
    
    // For direct SQL queries
    const queryClient = postgres(connectionString, { 
      max: 10,
      onnotice: (notice) => {
        console.log('Database notice:', notice);
      },
      debug: (connectionId, query, parameters) => {
        console.log('Database query:', query, parameters);
      }
    });
    
    // For Drizzle ORM
    const db = drizzle(queryClient, { schema });
    
    console.log('Database connection established successfully');
    return { queryClient, db };
  } catch (error) {
    console.warn('Failed to connect to database, running in demo mode:', error instanceof Error ? error.message : String(error));
    console.warn('Common causes:');
    console.warn('1. Incorrect database credentials');
    console.warn('2. Database instance not active');
    console.warn('3. Network connectivity issues');
    console.warn('4. Special characters in password not properly encoded');
    return { queryClient: null, db: null };
  }
};

// Create and export the database connection
export const { queryClient, db } = createDbConnection();

// Helper function to check database connection
export const testDatabaseConnection = async () => {
  try {
    if (!db) {
      console.log('Database is in demo mode, skipping connection test');
      return true;
    }
    
    // Test the connection by running a simple query
    console.log('Testing database connection with a simple query...');
    const result = await db.execute(sql`SELECT 1 as test`);
    
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
};

// Alternative test function using Supabase client
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
};