import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { User } from 'next-auth';
import bcrypt from 'bcrypt';

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
					console.error('Missing credentials');
					return null;
				}
				try {
					const user = await prisma.user.findUnique({
						where: { email: credentials.email },
					});
					if (!user) {
						console.error('User not found');
						return null;
					}

					const isValid = await bcrypt.compare(
						credentials.password,
						user.password
					);

					if (!isValid) {
						console.error('Invalid password');
						return null;
					}
					console.log('Authentication successful for user:', user.email);
					return { id: user.id, email: user.email, name: user.name };
				} catch (error) {
					console.error('Authorization error:', error);
					return null;
				}
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
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
};
