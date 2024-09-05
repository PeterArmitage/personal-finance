import NextAuth from 'next-auth';
import { authOptions } from '@/app/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export const runtime = 'edge';
export async function OPTIONS(request: Request) {
	try {
		const response = await handler(request);
		return response;
	} catch (error) {
		console.error('NextAuth error:', error);
		return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
