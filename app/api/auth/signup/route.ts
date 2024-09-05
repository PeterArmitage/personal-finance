import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { SignUpSchema } from '@/lib/schema/auth';

function hashPassword(password: string): string {
	return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { name, email, password } = SignUpSchema.parse(body);

		const existingUser = await prisma.user.findUnique({
			where: { email: email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ message: 'User with this email already exists' },
				{ status: 409 }
			);
		}

		const hashedPassword = hashPassword(password);

		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			},
		});

		return NextResponse.json(
			{
				message: 'User created successfully',
				user: { id: user.id, name: user.name, email: user.email },
			},
			{ status: 201 }
		);
	} catch (error) {
		// ... error handling
	}
}
