// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    
    try {
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get form data from request
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type' },
                { status: 400 }
            );
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size too large' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `customer-photos/${fileName}`;

        // Upload to Supabase Storage
        const { error } = await supabase.storage
            .from('public')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Supabase storage error:', error);
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('public')
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrl,
            message: 'File uploaded successfully'
        });

    } catch (error) {
        console.error('Error in file upload:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
    try {
        const { searchParams } = new URL(req.url);
        const path = searchParams.get('path');
        const bucketName = 'public';

        if (!path || !bucketName) {
            return NextResponse.json(
                { error: 'Bucket name or file path not provided' },
                { status: 400 }
            );
        }

        const { error } = await supabase.storage.from(bucketName).remove([path]);

        if (error) {
            console.error('Supabase delete error:', error.message);
            return NextResponse.json(
                { error: 'Failed to delete file from storage' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        );
    }
}

// Set appropriate limit for the request body
export const config = {
    api: {
        bodyParser: false,
    },
};