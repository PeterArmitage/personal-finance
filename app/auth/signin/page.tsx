'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInSchema } from '@/lib/validations/auth';
import { ZodError } from 'zod';

export default function SignIn() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		try {
			// Validate input data using Zod schema
			signInSchema.parse({ email, password });

			// Attempt to sign in using NextAuth
			const result = await signIn('credentials', {
				redirect: false, // Prevent automatic redirect
				email,
				password,
				rememberMe,
			});

			if (result?.error) {
				// Handle sign-in error
				setError('Invalid email or password');
			} else {
				// Redirect to dashboard on successful sign-in
				router.push('/dashboard');
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
					<CardTitle>Sign In</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className='grid w-full items-center gap-4'>
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
							<div className='flex items-center space-x-2 mt-4'>
								<input
									type='checkbox'
									id='remember'
									className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
									onChange={(e) => setRememberMe(e.target.checked)}
								/>
								<label htmlFor='remember' className='text-sm text-gray-600'>
									Remember me
								</label>
							</div>
						</div>
						{error && <p className='text-red-500 mt-2'>{error}</p>}
						<Button className='w-full mt-6' type='submit'>
							Sign In
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
