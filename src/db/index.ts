import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from '@neondatabase/serverless';
import * as schema from './schema';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

// Create database connection with connection pooling for production
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Create the database connection
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Create Supabase client for auth
export const supabase = createClient(supabaseUrl, supabaseKey); 