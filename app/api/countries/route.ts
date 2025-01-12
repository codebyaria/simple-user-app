import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';
import { ApiResponse, Country } from '@/types/database.types';

export async function GET(
    request: NextRequest
): Promise<NextResponse<ApiResponse<Country[]>>> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('countries')
            .select('*')
            .order('name')

        if (error) throw error

        return NextResponse.json({ data, message: 'Countries retrieved successfully' })
    } catch (error) {
        console.error('Error fetching countries:', error)
        return NextResponse.json(
            { error: 'Failed to fetch countries' },
            { status: 500 }
        )
    }
}