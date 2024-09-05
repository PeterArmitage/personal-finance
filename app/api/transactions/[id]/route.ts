import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PUT(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await req.json();
		const { description, amount, type, category, date } = body;

		const transaction = await prisma.transaction.update({
			where: { id: params.id },
			data: {
				description,
				amount,
				type,
				category,
				date: new Date(date),
			},
		});

		return NextResponse.json(transaction);
	} catch (error) {
		console.error('Error updating transaction:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		await prisma.transaction.delete({
			where: { id: params.id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting transaction:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
