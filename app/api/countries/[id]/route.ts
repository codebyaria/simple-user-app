import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ApiResponse, Country } from '@/types/database.types';

type RouteContext = {
    params: {
        id: string;
    };
};

export async function GET(
    request: NextRequest,
    context: RouteContext
): Promise<NextResponse<ApiResponse<Country>>> {
    try {
        const supabase = await createClient();
        const { id } = context.params;

        const { data, error } = await supabase
            .from('countries')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        if (!data) {
            return NextResponse.json(
                { error: 'Country not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data, message: 'Country retrieved successfully' });
    } catch (error) {
        console.error('Error fetching country by ID:', error);
        return NextResponse.json(
            { error: 'Failed to fetch country' },
            { status: 500 }
        );
    }
}