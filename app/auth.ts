import NextAuth, {
	AuthOptions,
	User,
	Session,
	DefaultSession,
} from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import { z } from 'zod';
import { CredentialsSchema } from '@/lib/schema/auth';
import { JWT } from 'next-auth/jwt';

interface ExtendedSession extends Session {
	user: {
		id: string;
		email: string;
		name: string;
		rememberMe: boolean;
	} & DefaultSession['user'];
}

// Extend the built-in user type
interface ExtendedUser extends User {
	rememberMe?: boolean;
}

export const authOptions: AuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials, req): Promise<ExtendedUser | null> {
				try {
					const { email, password } = CredentialsSchema.parse(credentials);
					const rememberMe = req.body?.rememberMe === 'true';

					const user = await prisma.user.findUnique({
						where: { email },
					});

					if (!user) {
						console.error('User not found:', email);
						return null;
					}

					const isPasswordValid = await compare(password, user.password);

					if (!isPasswordValid) {
						console.error('Invalid password for user:', email);
						return null;
					}

					return {
						id: user.id,
						email: user.email,
						name: user.name,
						rememberMe,
					};
				} catch (error) {
					if (error instanceof z.ZodError) {
						console.error('Validation error:', error.errors);
					} else {
						console.error('Authorization error:', error);
					}
					return null;
				}
			},
		}),
	],
	session: {
		strategy: 'jwt',
	},
	jwt: {
		secret: process.env.NEXTAUTH_SECRET,
		maxAge: 60 * 60 * 24 * 30, // 30 days
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: '/auth/signin',
	},
	callbacks: {
		async jwt({
			token,
			user,
			account,
		}): Promise<JWT & { rememberMe?: boolean }> {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
				token.rememberMe = (user as ExtendedUser).rememberMe;
			}
			return token;
		},
		async session({ session, token }): Promise<ExtendedSession> {
			return {
				...session,
				user: {
					...session.user,
					id: token.id as string,
					email: token.email as string,
					name: token.name as string,
					rememberMe: token.rememberMe as boolean,
				},
			};
		},
	},
	debug: process.env.NODE_ENV === 'development',
};
