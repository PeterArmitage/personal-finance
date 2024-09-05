'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { signUpSchema } from '@/lib/validations/auth';
import { ZodError } from 'zod';

export default function SignUp() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		try {
			// Validate input data using Zod schema
			signUpSchema.parse({ name, email, password });

			// Send POST request to signup API route
			const res = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name, email, password }),
			});

			if (res.ok) {
				// If signup is successful, attempt to sign in
				const result = await signIn('credentials', {
					redirect: false,
					email,
					password,
				});

				if (result?.error) {
					// Handle sign-in error
					setError('Failed to sign in after signup');
				} else {
					// Redirect to dashboard on successful sign-in
					router.push('/dashboard');
				}
			} else {
				// Handle signup error
				const data = await res.json();
				setError(data.message || 'Signup failed');
			}
		} catch (error) {
			// Handle validation errors
			if (error instanceof ZodError) {
				setError(error.errors[0].message);
			} else {
				setError('An unexpected error occurred');
			}
		}
	};

	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-background text-foreground'>
			<Card className='w-[350px]'>
				<CardHeader>
					<CardTitle>Sign Up</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className='grid w-full items-center gap-4'>
							<div className='flex flex-col space-y-1.5'>
								<Label htmlFor='name'>Name</Label>
								<Input
									id='name'
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>
							<div className='flex flex-col space-y-1.5'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
							<div className='flex flex-col space-y-1.5'>
								<Label htmlFor='password'>Password</Label>
								<Input
									id='password'
									type='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>
						</div>
						{error && <p className='text-red-500 mt-2'>{error}</p>}
						<Button className='w-full mt-6' type='submit'>
							Sign Up
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
