import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, Customer } from '@/types/database.types'
import { CustomerSchema, handleZodError } from '@/utils/validation'
import { z } from 'zod'

export async function GET(
    request: NextRequest,
    {params}: {params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Customer>>> {
    try {
        const supabase = await createClient()

        const { id } = await params

        const { data, error } = await supabase
            .from('customers')
            .select(`
        *,
        countries (
          id,
          name,
          code
        )
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        if (!data) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ data, message: 'Customer retrieved successfully' })
    } catch (error) {
        console.error('Error fetching customer by ID:', error)
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    {params}: {params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Customer>>> {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const { id } = await params

        if (!id) {
            return NextResponse.json(
                { error: 'Customer ID is required' },
                { status: 400 }
            );
        }

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error('Unauthorized');
        }

        // First check if the customer exists
        const { data: existingCustomer, error: checkError } = await supabase
            .from('customers')
            .select('id')
            .eq('id', id)
            .single()

        if (checkError || !existingCustomer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        // Validate partial input with Zod
        const validatedData = CustomerSchema.parse(body)

        console.log(validatedData);

        const updateData = {
            ...validatedData,
            updated_at: new Date().toISOString()
        }
        console.log('Update data being sent to Supabase:', updateData)

        const { error: updateError } = await supabase
            .from('customers')
            .update(updateData)
            .eq('id', id)

        if (updateError) {
            console.error('Update error:', updateError)
            throw updateError
        }

        const { data: updatedCustomer, error: fetchError } = await supabase
            .from('customers')
            .select(`
                *,
                countries (
                    id,
                    name,
                    code
                )
            `)
            .eq('id', id)
            .single()

        if (fetchError) {
            console.error('Fetch updated customer error:', fetchError)
            throw fetchError
        }

        if (!updatedCustomer) {
            return NextResponse.json(
                { error: 'Failed to retrieve updated customer' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data: updatedCustomer, message: 'Customer updated successfully' })
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error updating customer:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: handleZodError(error) },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    {params}: {params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
    try {
        const supabase = await createClient()
        const { id } = await params

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if customer exists
        const { data: existingCustomer, error: checkError } = await supabase
            .from('customers')
            .select('id')
            .eq('id', id)
            .single()

        if (checkError || !existingCustomer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        // Delete the customer
        const { error: deleteError } = await supabase
            .from('customers')
            .delete()
            .eq('id', id)

        if (deleteError) {
            throw deleteError
        }

        return NextResponse.json({
            message: 'Customer deleted successfully',
            data: null
        })
    } catch (error) {
        console.error('Error deleting customer:', error)
        return NextResponse.json(
            { error: 'Failed to delete customer' },
            { status: 500 }
        )
    }
}