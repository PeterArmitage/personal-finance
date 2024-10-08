import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { GoalSchema } from '@/lib/schema/auth';
import { UpdateGoalSchema } from '@/lib/schema/auth';

export async function GET() {
	const session = await getServerSession(authOptions);

	if (!session || !session.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const goals = await prisma.goal.findMany({
			where: { user: { email: session.user.email } },
		});

		return NextResponse.json(goals);
	} catch (error) {
		console.error('Error fetching goals:', error);
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
		const { name, category, targetAmount, deadline } = GoalSchema.parse(body);

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const goal = await prisma.goal.create({
			data: {
				name,
				category,
				targetAmount,
				currentAmount: 0,
				deadline: new Date(deadline),
				userId: user.id,
			},
		});

		return NextResponse.json(goal, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid input', details: error.errors },
				{ status: 400 }
			);
		}
		console.error('Error creating goal:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function PUT(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await req.json();
		const { id, currentAmount } = UpdateGoalSchema.parse(body);

		const updatedGoal = await prisma.goal.update({
			where: { id },
			data: { currentAmount },
		});

		return NextResponse.json(updatedGoal);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid input', details: error.errors },
				{ status: 400 }
			);
		}
		console.error('Error updating goal:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
