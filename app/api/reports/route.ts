import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { searchParams } = new URL(req.url);
	const timeFrame = searchParams.get('timeFrame') || 'month';

	try {
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const startDate = getStartDate(timeFrame);

		const incomes = await prisma.income.findMany({
			where: {
				userId: user.id,
				date: { gte: startDate },
			},
		});

		const expenses = await prisma.expense.findMany({
			where: {
				userId: user.id,
				date: { gte: startDate },
			},
		});

		const incomeByCategory = groupByCategory(incomes);
		const expensesByCategory = groupByCategory(expenses);
		const monthlyBalance = calculateMonthlyBalance(incomes, expenses);

		return NextResponse.json({
			incomeByCategory,
			expensesByCategory,
			monthlyBalance,
		});
	} catch (error) {
		console.error('Error fetching financial data:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

function getStartDate(timeFrame: string): Date {
	const now = new Date();
	switch (timeFrame) {
		case 'month':
			return new Date(now.getFullYear(), now.getMonth(), 1);
		case 'year':
			return new Date(now.getFullYear(), 0, 1);
		default:
			return new Date(0); // All time
	}
}

function groupByCategory(items: any[]): { [key: string]: number } {
	return items.reduce((acc, item) => {
		const category = item.category || item.source;
		acc[category] = (acc[category] || 0) + item.amount;
		return acc;
	}, {});
}

function calculateMonthlyBalance(
	incomes: any[],
	expenses: any[]
): { month: string; balance: number }[] {
	const monthlyData: { [key: string]: { income: number; expense: number } } =
		{};

	[...incomes, ...expenses].forEach((item) => {
		const month = item.date.toISOString().slice(0, 7); // YYYY-MM
		if (!monthlyData[month]) {
			monthlyData[month] = { income: 0, expense: 0 };
		}
		if ('source' in item) {
			monthlyData[month].income += item.amount;
		} else {
			monthlyData[month].expense += item.amount;
		}
	});

	return Object.entries(monthlyData)
		.map(([month, data]) => ({
			month,
			balance: data.income - data.expense,
		}))
		.sort((a, b) => a.month.localeCompare(b.month));
}
