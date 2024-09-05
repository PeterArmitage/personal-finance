import { getServerSession as originalGetServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
	GetServerSidePropsContext,
	NextApiRequest,
	NextApiResponse,
} from 'next';

export async function getServerSession(
	context:
		| GetServerSidePropsContext
		| { req: NextApiRequest; res: NextApiResponse }
) {
	const session = await originalGetServerSession(
		context.req,
		context.res,
		authOptions
	);

	if (session) {
		const rememberMe = (session.user as any)?.rememberMe;
		if (rememberMe) {
			// Set a longer expiration for "Remember Me" sessions
			session.expires = new Date(
				Date.now() + 30 * 24 * 60 * 60 * 1000
			).toISOString(); // 30 days
		} else {
			// Set a shorter expiration for regular sessions
			session.expires = new Date(
				Date.now() + 24 * 60 * 60 * 1000
			).toISOString(); // 1 day
		}
	}

	return session;
}
