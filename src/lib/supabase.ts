import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export function createSupabaseBrowserClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Server-side client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role for admin operations
export function createAdminClient() {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
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
