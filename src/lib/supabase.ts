import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client-side Supabase client
export function createSupabaseBrowserClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables are missing. Initialization may fail if called at runtime.');
    }
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Server-side client for public operations
let supabaseClient: any = null;
export function getSupabase() {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('process.env.NEXT_PUBLIC_SUPABASE_URL and process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
    }
    if (!supabaseClient) {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseClient;
}

// Server-side client with service role for admin operations
export function createAdminClient() {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('process.env.NEXT_PUBLIC_SUPABASE_URL and process.env.SUPABASE_SERVICE_ROLE_KEY are required at runtime');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

// Types for our database
export interface Page {
    id: string;
    name: string;
    layout: Record<string, unknown>;
    updated_at: string;
}

export interface UseCase {
    id: string;
    title: string;
    slug: string;
    content: string;
    description: string;
    image: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Section {
    id: string;
    content: string;
    updated_at: string;
}
