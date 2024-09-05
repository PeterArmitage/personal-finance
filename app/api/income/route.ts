import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const IncomeSchema = z.object({
	amount: z.number().positive(),
	description: z.string().min(1),
	source: z.string().min(1),
	date: z.string().refine((date) => !isNaN(Date.parse(date)), {
		message: 'Invalid date format',
	}),
});

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await req.json();
		const { amount, description, source, date } = IncomeSchema.parse(body);

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const income = await prisma.income.create({
			data: {
				amount,
				description,
				source,
				date: new Date(date),
				userId: user.id,
			},
		});

		return NextResponse.json(income, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid input', details: error.errors },
				{ status: 400 }
			);
		}
		console.error('Error creating income:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
