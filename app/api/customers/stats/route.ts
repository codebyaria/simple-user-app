import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';

interface CustomerStats {
    total: number;
    wni: number;
    wna: number;
}

export async function GET() {
    const supabase = await createClient();
    
    try {
        // Check authentication
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error('Unauthorized');
        }

        // Get total count
        const { count: total, error: totalError } = await supabase
            .from('customers')
            .select('*', { count: 'exact' });

        if (totalError) throw totalError;

        // Get WNI count
        const { count: wni, error: wniError } = await supabase
            .from('customers')
            .select('*', { count: 'exact' })
            .eq('nationality', 'wni');

        if (wniError) throw wniError;

        // Get WNA count
        const { count: wna, error: wnaError } = await supabase
            .from('customers')
            .select('*', { count: 'exact' })
            .eq('nationality', 'wna');

        if (wnaError) throw wnaError;

        const stats: CustomerStats = {
            total: total || 0,
            wni: wni || 0,
            wna: wna || 0
        };

        return NextResponse.json(stats);
        
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Error fetching customer stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customer statistics' },
            { status: 500 }
        );
    }
}