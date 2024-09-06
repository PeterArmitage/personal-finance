import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const userCount = await prisma.user.count();
		console.log(`Number of users in database: ${userCount}`);

		return NextResponse.json({
			message: 'Database connection successful',
			userCount,
		});
	} catch (error) {
		console.error('Database connection error:', error);
		return NextResponse.json(
			{
				error: 'Database connection failed',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
