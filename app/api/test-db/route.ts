import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		await prisma.$connect();
		return NextResponse.json({ message: 'Database connection successful' });
	} catch (error) {
		console.error('Database connection error:', error);
		return NextResponse.json(
			{ error: 'Database connection failed' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
