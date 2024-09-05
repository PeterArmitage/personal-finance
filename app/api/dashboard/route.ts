import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { DashboardResponseSchema } from '@/lib/schema/auth';

export async function GET() {
	const session = await getServerSession(authOptions);

	if (!session || !session.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			include: {
				expenses: { orderBy: { date: 'desc' }, take: 5 },
				incomes: { orderBy: { date: 'desc' }, take: 5 },
			},
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const totalIncome = user.incomes.reduce(
			(sum, income) => sum + income.amount,
			0
		);
		const totalExpenses = user.expenses.reduce(
			(sum, expense) => sum + expense.amount,
			0
		);
		const currentBalance = totalIncome - totalExpenses;

		const recentTransactions = [...user.expenses, ...user.incomes]
			.sort((a, b) => b.date.getTime() - a.date.getTime())
			.slice(0, 5)
			.map((transaction) => ({
				id: transaction.id,
				description: transaction.description,
				amount:
					'source' in transaction ? transaction.amount : -transaction.amount,
				date: transaction.date.toISOString(),
			}));

		const responseData = {
			totalIncome,
			totalExpenses,
			currentBalance,
			recentTransactions,
		};

		const validatedData = DashboardResponseSchema.parse(responseData);

		return NextResponse.json(validatedData);
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error('Validation error:', error.errors);
			return NextResponse.json(
				{ error: 'Data validation failed' },
				{ status: 500 }
			);
		}
		console.error('Error fetching dashboard data:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
