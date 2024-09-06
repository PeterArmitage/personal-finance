import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (process.env.NODE_ENV !== 'production') {
	console.log('DATABASE_URL:', process.env.DATABASE_URL);
}

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: ['query', 'info', 'warn', 'error'],
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
