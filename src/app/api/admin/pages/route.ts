import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase';

export const runtime = 'edge';

// GET - Fetch page layout (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pageId = searchParams.get('id') || 'home';

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('pages')
            .select('*')
            .eq('id', pageId)
            .single();

        if (error) {
            // Return empty layout if page doesn't exist yet
            return NextResponse.json({ id: pageId, name: pageId, layout: null });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Save page layout (protected)
export async function PUT(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, layout } = body;

        if (!id || !layout) {
            return NextResponse.json(
                { error: 'Page ID and layout are required' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('pages')
            .upsert({
                id,
                name: name || id,
                layout,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving page:', error);
            return NextResponse.json({ error: 'Failed to save page' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
