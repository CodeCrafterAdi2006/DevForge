import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Attempt to get the session - this checks if the Supabase client can contact the server
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            return NextResponse.json({
                success: false,
                message: 'Supabase returned an error',
                error
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully connected to Supabase!',
            session: data.session
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            message: 'Failed to initialize or connect',
            error: err.message
        }, { status: 500 });
    }
}
