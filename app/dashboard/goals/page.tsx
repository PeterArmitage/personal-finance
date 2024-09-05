'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Goal } from '@/types/index';
import { useToast } from '@/components/ui/use-toast';

export default function GoalsPage() {
	const [goals, setGoals] = useState<Goal[]>([]);
	const [newGoal, setNewGoal] = useState({
		name: '',
		category: '',
		targetAmount: '',
		deadline: '',
	});
	const [error, setError] = useState('');
	const router = useRouter();
	const { data: session, status } = useSession();
	const { toast } = useToast();

	useEffect(() => {
		if (status === 'authenticated') {
			fetchGoals();
		}
	}, [status]);

	useEffect(() => {
		if (goals.length > 0) {
			const now = new Date();
			goals.forEach((goal) => {
				const deadline = new Date(goal.deadline);
				const daysUntilDeadline = Math.ceil(
					(deadline.getTime() - now.getTime()) / (1000 * 3600 * 24)
				);
				if (daysUntilDeadline <= 7 && goal.currentAmount < goal.targetAmount) {
					toast({
						title: 'Goal Deadline Approaching',
						description: `Your goal "${goal.name}" is due in ${daysUntilDeadline} days.`,
					});
				}
			});
		}
	}, [goals, toast]);

	const fetchGoals = async () => {
		const response = await fetch('/api/goals');
		if (response.ok) {
			const data = await response.json();
			setGoals(data);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!session) {
			setError('You must be signed in to add a goal');
			return;
		}

		try {
			const response = await fetch('/api/goals', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: newGoal.name,
					category: newGoal.category,
					targetAmount: parseFloat(newGoal.targetAmount),
					deadline: new Date(newGoal.deadline).toISOString(),
				}),
			});

			if (response.ok) {
				setNewGoal({ name: '', category: '', targetAmount: '', deadline: '' });
				fetchGoals();
			} else {
				const data = await response.json();
				setError(data.message || 'Failed to add goal');
			}
		} catch (error) {
			setError('An unexpected error occurred');
		}
	};

	const handleUpdateProgress = async (id: string, currentAmount: number) => {
		try {
			const response = await fetch('/api/goals', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id, currentAmount }),
			});

			if (response.ok) {
				fetchGoals();
			} else {
				const data = await response.json();
				setError(data.message || 'Failed to update goal');
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
			<h1 className='text-2xl font-bold mb-4'>Financial Goals</h1>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				<Card>
					<CardHeader>
						<CardTitle>Add New Goal</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit}>
							<div className='grid w-full items-center gap-4'>
								<div className='flex flex-col space-y-1.5'>
									<Label htmlFor='name'>Goal Name</Label>
									<Input
										id='name'
										value={newGoal.name}
										onChange={(e) =>
											setNewGoal({ ...newGoal, name: e.target.value })
										}
										required
									/>
								</div>
								<div className='flex flex-col space-y-1.5'>
									<Label htmlFor='category'>Category</Label>
									<Input
										id='category'
										value={newGoal.category}
										onChange={(e) =>
											setNewGoal({ ...newGoal, category: e.target.value })
										}
										required
									/>
								</div>
								<div className='flex flex-col space-y-1.5'>
									<Label htmlFor='targetAmount'>Target Amount</Label>
									<Input
										id='targetAmount'
										type='number'
										value={newGoal.targetAmount}
										onChange={(e) =>
											setNewGoal({ ...newGoal, targetAmount: e.target.value })
										}
										required
									/>
								</div>
								<div className='flex flex-col space-y-1.5'>
									<Label htmlFor='deadline'>Deadline</Label>
									<Input
										id='deadline'
										type='date'
										value={newGoal.deadline}
										onChange={(e) =>
											setNewGoal({ ...newGoal, deadline: e.target.value })
										}
										required
									/>
								</div>
							</div>
							{error && <p className='text-red-500 mt-2'>{error}</p>}
							<Button className='w-full mt-6' type='submit'>
								Add Goal
							</Button>
						</form>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Your Goals</CardTitle>
					</CardHeader>
					<CardContent>
						<ul>
							{goals.map((goal) => (
								<li key={goal.id} className='mb-4'>
									<h3 className='font-semibold'>{goal.name}</h3>
									<p>Target: ${goal.targetAmount.toFixed(2)}</p>
									<p>Current: ${goal.currentAmount.toFixed(2)}</p>
									<p>
										Deadline: {new Date(goal.deadline).toLocaleDateString()}
									</p>
									<progress
										value={goal.currentAmount}
										max={goal.targetAmount}
										className='w-full'
									></progress>
									<Input
										type='number'
										placeholder='Update progress'
										onChange={(e) =>
											handleUpdateProgress(goal.id, parseFloat(e.target.value))
										}
									/>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
