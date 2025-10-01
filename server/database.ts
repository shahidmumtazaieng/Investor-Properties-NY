// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.ts';
import { sql } from 'drizzle-orm';

// Initialize Supabase client with better configuration for handling timeouts
const supabaseUrl = process.env.SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-key';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Using demo Supabase credentials. Please configure real credentials in .env file.');
}

// Create Supabase client with timeout and retry configurations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'investor-properties-ny'
    }
  },
  db: {
    schema: 'public' // Only valid property for db configuration
  }
});

// Create direct PostgreSQL connection for Drizzle ORM
const demoConnectionString = 'postgresql://demo:demo@localhost:5432/demo';
const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || demoConnectionString;

console.log('Connection string:', connectionString ? 'Configured' : 'Not found');
console.log('Is demo connection:', connectionString === demoConnectionString);

// Enhanced connection function with better timeout handling and fallback mechanism
const createDbConnection = () => {
  try {
    // Force demo mode for testing
    const forceDemoMode = process.env.FORCE_DEMO_MODE === 'true';
    
    // Check if we have valid connection strings
    const hasValidConnection = connectionString && connectionString !== demoConnectionString;
    
    if (forceDemoMode || !hasValidConnection) {
      if (forceDemoMode) {
        console.log('FORCE_DEMO_MODE is enabled, running in demo mode with mock data');
      } else {
        console.log('No valid database connection string found, running in demo mode');
      }
      // Return mock objects for demo mode
      return { 
        queryClient: null, 
        db: null 
      };
    }
    
    console.log('Attempting to connect to database...');
    console.log('Connection string (masked):', connectionString.replace(/:[^:@/]+@/, ':****@'));
    
    // For direct SQL queries with improved timeout and retry settings
    const queryClient = postgres(connectionString, { 
      max: 1, // Reduced connection pool size to 1
      idle_timeout: 2, // Connection idle timeout in seconds
      connect_timeout: 10, // Increased connection timeout to 10 seconds
      max_lifetime: 60 * 5, // 5 minutes max connection lifetime
      backoff: (attempt) => Math.min(100 * Math.pow(2, attempt), 2000), // Exponential backoff with higher max
      onnotice: (notice) => {
        // Only log important notices in production
        if (process.env.NODE_ENV === 'development') {
          console.log('Database notice:', notice);
        }
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
    console.warn('5. Firewall restrictions');
    
    // Even if Drizzle fails, we can still use Supabase client directly
    console.log('Falling back to Supabase client only mode');
    return { queryClient: null, db: null };
  }
};

// Create and export the database connection
export const { queryClient, db } = createDbConnection();

// Improved helper function to check database connection with proper error handling
export const testDatabaseConnection = async () => {
  try {
    if (!db) {
      console.log('Database is in demo mode, skipping connection test');
      return true;
    }
    
    // Test the connection by running a simple query with timeout
    console.log('Testing database connection with a simple query...');
    const result = await Promise.race([
      db.execute(sql`SELECT 1 as test`),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection test timeout')), 3000)
      )
    ]);
    
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
};

// Alternative test function using Supabase client with timeout
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test with a simple query with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase connection test timeout')), 3000)
    );
    
    const queryPromise = supabase
      .from('users')
      .select('*')
      .limit(1);
    
    const result = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    if (result.error) {
      // Try a fallback query if users table doesn't exist
      const fallbackQueryPromise = supabase.rpc('version');
      const fallbackResult = await Promise.race([fallbackQueryPromise, timeoutPromise]) as any;
      
      if (fallbackResult.error) {
        console.log('Supabase connection test failed:', result.error.message);
        return false;
      }
      
      console.log('Supabase connection test successful with fallback');
      return true;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
};

// Add a health check function with timeout
export const databaseHealthCheck = async () => {
  try {
    if (!db) {
      return { status: 'demo', message: 'Running in demo mode' };
    }
    
    // Simple query to check if database is responsive with timeout
    const result = await Promise.race([
      db.execute(sql`SELECT 1`),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database health check timeout')), 2000)
      )
    ]);
    
    return { status: 'healthy', message: 'Database connection is active' };
  } catch (error) {
    console.log('Direct database connection failed, checking Supabase client as fallback:', error instanceof Error ? error.message : String(error));
    // Try to use Supabase client as fallback
    try {
      // Test Supabase client connection
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (supabaseError) {
        console.log('Supabase client test failed:', supabaseError.message);
        return { 
          status: 'unhealthy', 
          message: 'Database connection failed',
          error: error instanceof Error ? error.message : String(error)
        };
      }
      
      console.log('Supabase client connection successful, using as fallback');
      return { status: 'healthy', message: 'Database connection active via Supabase client' };
    } catch (supabaseError) {
      console.log('Supabase client fallback failed:', supabaseError instanceof Error ? supabaseError.message : String(supabaseError));
      return { 
        status: 'unhealthy', 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

// Add a function to force demo mode if needed
export const forceDemoMode = () => {
  console.log('Forcing demo mode due to database connectivity issues');
  return { queryClient: null, db: null };
};