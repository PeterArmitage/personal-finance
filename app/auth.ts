import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { User } from 'next-auth';

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
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
					where: { email: credentials.email },
				});
				if (!user) {
					return null;
				}

				// Use a server-side API route for password comparison
				const isValid = await fetch('/api/auth/compare-password', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						password: credentials.password,
						hash: user.password,
					}),
				}).then((res) => res.json());

				if (!isValid) {
					return null;
				}
				return { id: user.id, email: user.email, name: user.name };
			},
		}),
	],
	session: { strategy: 'jwt' },
	callbacks: {
		async jwt({ token, user }: { token: JWT; user?: User }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }: { session: Session; token: JWT }) {
			if (session.user) {
				(session.user as any).id = token.id as string;
			}
			return session;
		},
	},
	pages: {
		signIn: '/auth/signin',
	},
	debug: process.env.NODE_ENV === 'development',
};
