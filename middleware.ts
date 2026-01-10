import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UAParser } from 'ua-parser-js';

export function middleware(req: NextRequest) {
    const ua = req.headers.get("user-agent") || "";
    const parsed = new UAParser(ua).getResult();
    const { pathname, searchParams } = req.nextUrl;

    const isMobile = parsed.device.type === "mobile" || parsed.device.type === "tablet";

    // get search params
    const note = searchParams.get("note");

    // Handle note on mobile
    if (note && note !== "" && isMobile) {
        const url = req.nextUrl.clone();
        url.pathname = `/note/${note}`;
        url.searchParams.delete("note");
        return NextResponse.redirect(url);
    }

    // Reverse for Desktop: /note/:noteid -> /?note=noteid
    if (!isMobile && pathname.startsWith('/note/')) {
        const noteId = pathname.replace('/note/', '');
        if (noteId) {
            const url = req.nextUrl.clone();
            url.pathname = '/';
            url.searchParams.set('note', noteId);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};