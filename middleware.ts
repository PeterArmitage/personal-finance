import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

	if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
		return NextResponse.redirect(new URL('/auth/signin', req.url));
	}

	const response = NextResponse.next();

	// CORS headers
	response.headers.set('Access-Control-Allow-Origin', '*');
	response.headers.set(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, DELETE, OPTIONS'
	);
	response.headers.set(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization'
	);

	// Security headers
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');

	return response;
}

// Optional: Configure which routes use this middleware
export const config = {
	matcher: [
		'/dashboard/:path*',
		'/api/auth/:path*',
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};
