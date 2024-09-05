import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const BudgetSchema = z.object({
	category: z.string().min(1),
	amount: z.number().positive(),
});

export async function GET() {
	const session = await getServerSession(authOptions);

	if (!session || !session.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const budgets = await prisma.budget.findMany({
			where: { user: { email: session.user.email } },
		});

		return NextResponse.json(budgets);
	} catch (error) {
		console.error('Error fetching budgets:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await req.json();
		const { category, amount } = BudgetSchema.parse(body);

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const budget = await prisma.budget.create({
			data: {
				category,
				amount,
				userId: user.id,
			},
		});

		return NextResponse.json(budget, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid input', details: error.errors },
				{ status: 400 }
			);
		}
		console.error('Error creating budget:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
