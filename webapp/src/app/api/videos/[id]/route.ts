import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: 'Video ID is required' },
                { status: 400 }
            );
        }

        // Supabaseから動画を削除
        // CASCADE設定により、関連する analysis_groups も自動的に削除される想定
        const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { message: 'Database delete failed', error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Video deleted successfully' });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
