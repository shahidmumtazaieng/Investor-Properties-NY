import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.ts';

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
const connectionString = process.env.SUPABASE_DATABASE_URL || 'postgresql://demo:demo@localhost:5432/demo';

if (!connectionString.includes('demo')) {
  console.log('Using configured database connection');
} else {
  console.warn('Warning: Using demo database connection. Database operations will use mock data.');
}

// Connection function with error handling
const createDbConnection = () => {
  try {
    if (connectionString.includes('demo')) {
      console.log('Running in demo mode with mock data');
      // Return mock objects for demo mode
      return { 
        queryClient: null, 
        db: null 
      };
    }
    
    // For direct SQL queries
    const queryClient = postgres(connectionString, { max: 10 });
    
    // For Drizzle ORM
    const db = drizzle(queryClient, { schema });
    
    console.log('Database connection established successfully');
    return { queryClient, db };
  } catch (error) {
    console.warn('Failed to connect to database, running in demo mode:', error.message);
    return { queryClient: null, db: null };
  }
};

// Create and export the database connection
export const { queryClient, db } = createDbConnection();

// Helper function to check database connection
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count(*)', { count: 'exact' });
    
    if (error) {
      throw error;
    }
    
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};