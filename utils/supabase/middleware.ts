import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const PUBLIC_FILE = /\.(.*)$/;
    if (PUBLIC_FILE.test(request.nextUrl.pathname)) {
        return supabaseResponse;
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user && request.nextUrl.pathname !== '/login' && !request.nextUrl.pathname.includes('/api')) {
        const url = new URL('/login', request.url);
        return NextResponse.redirect(url, { status: 302 }); // Explicitly set status
    }

    if ((user && request.nextUrl.pathname === '/login') || (user && request.nextUrl.pathname === '/')) {
        const url = new URL('/customers', request.url);
        return NextResponse.redirect(url, { status: 302 }); // Explicitly set status
    }

    return supabaseResponse
}