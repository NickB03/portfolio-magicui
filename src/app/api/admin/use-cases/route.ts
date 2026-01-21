import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createAdminClient, type UseCase } from '@/lib/supabase';

export const runtime = 'edge';

// GET - List all use cases (public)
export async function GET() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('use_cases')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching use cases:', error);
            return NextResponse.json({ error: 'Failed to fetch use cases' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new use case (protected)
export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, slug, content, description, image } = body;

        if (!title || !slug) {
            return NextResponse.json(
                { error: 'Title and slug are required' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('use_cases')
            .insert({
                id: slug,
                title,
                slug,
                content: content || '',
                description: description || '',
                image: image || null,
                active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating use case:', error);
            return NextResponse.json({ error: 'Failed to create use case' }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
