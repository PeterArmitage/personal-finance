import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const ITEMS_PER_PAGE = 10;

export async function GET(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { searchParams } = new URL(req.url);
	const filter = searchParams.get('filter') || 'all';
	const sort = searchParams.get('sort') || 'date';
	const search = searchParams.get('search') || '';
	const page = parseInt(searchParams.get('page') || '1', 10);
	const startDate = searchParams.get('startDate');
	const endDate = searchParams.get('endDate');

	try {
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const where: Prisma.TransactionWhereInput = {
			userId: user.id,
			...(filter !== 'all' && { type: filter as 'income' | 'expense' }),
			...(search && {
				OR: [
					{ description: { contains: search, mode: 'insensitive' } },
					{ category: { contains: search, mode: 'insensitive' } },
				],
			}),
			...(startDate &&
				endDate && {
					date: {
						gte: new Date(startDate),
						lte: new Date(endDate),
					},
				}),
		};

		const totalItems = await prisma.transaction.count({ where });
		const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

		const transactions = await prisma.transaction.findMany({
			where,
			orderBy: { [sort]: 'desc' } as Prisma.TransactionOrderByWithRelationInput,
			take: ITEMS_PER_PAGE,
			skip: (page - 1) * ITEMS_PER_PAGE,
		});

		return NextResponse.json({
			transactions,
			totalPages,
		});
	} catch (error) {
		console.error('Error fetching transactions:', error);
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
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const body = await req.json();
		const { description, amount, type, category, date } = body;

		const transaction = await prisma.transaction.create({
			data: {
				description,
				amount,
				type,
				category,
				date: new Date(date),
				userId: user.id,
			},
		});

		return NextResponse.json(transaction, { status: 201 });
	} catch (error) {
		console.error('Error creating transaction:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
