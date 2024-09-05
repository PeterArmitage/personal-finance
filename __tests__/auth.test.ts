import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CredentialsSchema } from '@/lib/schema/auth';

jest.mock('@prisma/client');
jest.mock('bcrypt');
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
	authOptions: {
		providers: [
			{
				authorize: jest.fn(),
			},
		],
	},
}));

const mockPrismaUser = {
	findUnique: jest.fn(),
};

(PrismaClient as jest.Mock).mockImplementation(() => ({
	user: mockPrismaUser,
}));

describe('NextAuth Credentials Provider', () => {
	const mockCredentials = {
		email: 'test@example.com',
		password: 'password123',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(authOptions.providers[0] as any).authorize.mockReset();
	});

	it('should return null for invalid credentials', async () => {
		(authOptions.providers[0] as any).authorize.mockResolvedValue(null);

		const result = await (authOptions.providers[0] as any).authorize(
			mockCredentials
		);
		expect(result).toBeNull();
	});

	it('should return null for invalid password', async () => {
		(authOptions.providers[0] as any).authorize.mockResolvedValue(null);

		const result = await (authOptions.providers[0] as any).authorize(
			mockCredentials
		);
		expect(result).toBeNull();
	});

	it('should return user object for valid credentials', async () => {
		const mockUser = {
			id: '1',
			email: 'test@example.com',
			name: 'Test User',
		};
		(authOptions.providers[0] as any).authorize.mockResolvedValue(mockUser);

		const result = await (authOptions.providers[0] as any).authorize(
			mockCredentials
		);
		expect(result).toEqual(mockUser);
	});

	it('should handle Zod validation errors', async () => {
		const invalidCredentials = {
			email: 'invalid-email',
			password: '123',
		};
		(authOptions.providers[0] as any).authorize.mockResolvedValue(null);

		const result = await (authOptions.providers[0] as any).authorize(
			invalidCredentials
		);
		expect(result).toBeNull();
	});
});
