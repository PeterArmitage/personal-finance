import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import { compare } from 'bcrypt';

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				try {
					if (!credentials?.email || !credentials?.password) {
						console.error('Missing credentials');
						return null;
					}
					const user = await prisma.user.findUnique({
						where: {
							email: credentials.email,
						},
					});
					if (!user) {
						console.error('User not found');
						return null;
					}
					const isPasswordValid = await compare(
						credentials.password,
						user.password
					);
					if (!isPasswordValid) {
						console.error('Invalid password');
						return null;
					}
					return {
						id: user.id,
						email: user.email,
						name: user.name,
					};
				} catch (error) {
					console.error('Authorization error:', error);
					return null;
				}
			},
		}),
	],
	callbacks: {
		jwt: ({ token, user, account }) => {
			if (user) {
				const u = user as unknown as any;
				return {
					...token,
					id: u.id,
					rememberMe: u.rememberMe,
				};
			}
			if (account) {
				token.rememberMe = account.rememberMe;
			}
			return token;
		},
		session: ({ session, token }) => {
			return {
				...session,
				user: {
					...session.user,
					id: token.id,
					rememberMe: token.rememberMe,
				},
			};
		},
	},
};
