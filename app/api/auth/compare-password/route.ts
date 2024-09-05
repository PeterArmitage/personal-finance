import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';

export async function POST(req: Request) {
	const { password, hash } = await req.json();
	const isValid = await compare(password, hash);
	return NextResponse.json(isValid);
}
