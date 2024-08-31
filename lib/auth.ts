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
	},
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}
				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email,
					},
				});
				if (!user) {
					return null;
				}
				const isPasswordValid = await compare(
					credentials.password,
					user.password
				);
				if (!isPasswordValid) {
					return null;
				}
				return {
					id: user.id,
					email: user.email,
					name: user.name,
				};
			},
		}),
	],
	callbacks: {
		session: ({ session, token }) => {
			return {
				...session,
				user: {
					...session.user,
					id: token.id,
				},
			};
		},
		jwt: ({ token, user }) => {
			if (user) {
				const u = user as unknown as any;
				return {
					...token,
					id: u.id,
				};
			}
			return token;
		},
	},
};
