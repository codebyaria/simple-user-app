import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';
import { CustomerSchema, handleZodError } from '@/utils/validation';
import { z } from 'zod';
import { ApiResponse, Customer } from '@/types/database.types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Customer[]>>> {
    const supabase = await createClient();
    try {

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error('Unauthorized');
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const filter = searchParams.get('filter') || 'all';
        const sortBy = searchParams.get('sortBy') || '';
        const sortOrder = searchParams.get('sortOrder') || 'asc';
        const offset = (page - 1) * limit;

        let query = supabase
            .from('customers')
            .select('*, countries(*)', { count: 'exact' });

        console.log(sortBy);
        console.log(sortOrder);
        console.log(filter);
        
        // Apply filters
        if (filter !== 'all') {
            query = query.eq('nationality', filter);
        }

        // Apply search
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        // Apply sorting
        if (sortBy) {
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        }

        const { data, error, count } = await query
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return NextResponse.json({
            data,
            page,
            limit,
            total: count,
            totalPages: Math.ceil((count || 0) / limit)
        });
    } catch (error) {

        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Customer>>> {
    const supabase = await createClient();
    try {
        const body = await request.json();
        const validatedData = CustomerSchema.parse(body);

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error('Unauthorized');
        }

        const { data, error } = await supabase
            .from('customers')
            .insert({
                ...validatedData,
                created_by: user.id
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: handleZodError(error) },
                { status: 400 }
            )
        }

        console.error('Error creating customer:', error);
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        );
    }
}