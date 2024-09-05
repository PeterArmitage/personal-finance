import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { SignUpSchema } from '@/lib/schema/auth';

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

		const hashedPassword = await hash(password, 10);

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
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ message: 'Invalid input', errors: error.errors },
				{ status: 400 }
			);
		}
		console.error('Signup error:', error);
		return NextResponse.json(
			{ message: 'Something went wrong' },
			{ status: 500 }
		);
	}
}
