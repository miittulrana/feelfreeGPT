import { createClient } from '@supabase/supabase-js';

// Explicitly log env variables during development
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  // Don't log the full key for security, just first few chars
  console.log('Supabase Key (first 6 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 6));
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Missing Supabase environment variables:
    URL: ${supabaseUrl ? 'Found' : 'Missing'}
    Key: ${supabaseAnonKey ? 'Found' : 'Missing'}
  Please check your .env file.`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'feelfreegpt'
    }
  }
});

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};