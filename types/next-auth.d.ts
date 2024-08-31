import { NextAuthUser } from '@/types';

declare module 'next-auth' {
	interface User extends NextAuthUser {}
}
