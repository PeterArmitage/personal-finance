import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ExpenseSchema = z.object({
	amount: z.number().positive(),
	description: z.string().min(1),
	category: z.string().min(1),
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
		const { amount, description, category, date } = ExpenseSchema.parse(body);

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const expense = await prisma.expense.create({
			data: {
				amount,
				description,
				category,
				date: new Date(date),
				userId: user.id,
			},
		});

		return NextResponse.json(expense, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid input', details: error.errors },
				{ status: 400 }
			);
		}
		console.error('Error creating expense:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
