import NextAuth, { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import { z } from 'zod';
import { CredentialsSchema } from '@/lib/schema/auth';

export const authOptions: AuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials, req) {
				try {
					const { email, password } = CredentialsSchema.parse(credentials);
					const rememberMe = req.body?.rememberMe === 'true';

					const user = await prisma.user.findUnique({
						where: { email },
					});

					if (!user) {
						return null;
					}

					const isPasswordValid = await compare(password, user.password);

					if (!isPasswordValid) {
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
		async jwt({ token, user, account }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
				token.rememberMe = user.rememberMe;
			}
			return token;
		},
		async session({ session, token }) {
			session.user.id = token.id;
			session.user.email = token.email;
			session.user.name = token.name;
			session.user.rememberMe = token.rememberMe;
			return session;
		},
	},
	debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
