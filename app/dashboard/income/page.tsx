'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function IncomePage() {
	const [amount, setAmount] = useState('');
	const [description, setDescription] = useState('');
	const [source, setSource] = useState('');
	const [date, setDate] = useState('');
	const [error, setError] = useState('');
	const router = useRouter();
	const { data: session, status } = useSession();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!session) {
			setError('You must be signed in to add income');
			return;
		}

		try {
			const response = await fetch('/api/income', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					amount: parseFloat(amount),
					description,
					source,
					date: new Date(date),
				}),
			});

			if (response.ok) {
				router.push('/dashboard');
			} else {
				const data = await response.json();
				setError(data.message || 'Failed to add income');
			}
		} catch (error) {
			setError('An unexpected error occurred');
		}
	};

	if (status === 'loading') {
		return <div>Loading...</div>;
	}

	if (!session) {
		router.push('/auth/signin');
		return null;
	}

	return (
		<div className='container mx-auto p-4'>
			<Card>
				<CardHeader>
					<CardTitle>Add Income</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className='grid w-full items-center gap-4'>
							<div className='flex flex-col space-y-1.5'>
								<Label htmlFor='amount'>Amount</Label>
								<Input
									id='amount'
									type='number'
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									required
								/>
							</div>
							<div className='flex flex-col space-y-1.5'>
								<Label htmlFor='description'>Description</Label>
								<Input
									id='description'
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									required
								/>
							</div>
							<div className='flex flex-col space-y-1.5'>
								<Label htmlFor='source'>Source</Label>
								<Input
									id='source'
									value={source}
									onChange={(e) => setSource(e.target.value)}
									required
								/>
							</div>
							<div className='flex flex-col space-y-1.5'>
								<Label htmlFor='date'>Date</Label>
								<Input
									id='date'
									type='date'
									value={date}
									onChange={(e) => setDate(e.target.value)}
									required
								/>
							</div>
						</div>
						{error && <p className='text-red-500 mt-2'>{error}</p>}
						<Button className='w-full mt-6' type='submit'>
							Add Income
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
