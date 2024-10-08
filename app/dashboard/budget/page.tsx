'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import { Budget } from '@/types/index';
import { Goal } from '@/types/index';
import { Skeleton } from '../../components/Skeleton';
// Mock data for visualization
const mockBudgets: Budget[] = [
	{ id: '1', category: 'Food', amount: 500 },
	{ id: '2', category: 'Rent', amount: 1000 },
	{ id: '3', category: 'Transportation', amount: 200 },
	{ id: '4', category: 'Entertainment', amount: 150 },
	{ id: '5', category: 'Utilities', amount: 300 },
];

export default function BudgetPage() {
	const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
	const [newCategory, setNewCategory] = useState('');
	const [newAmount, setNewAmount] = useState('');
	const [error, setError] = useState('');
	const router = useRouter();
	const { data: session, status } = useSession();
	const [goals, setGoals] = useState<Goal[]>([]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!session) {
			setError('You must be signed in to add a budget');
			return;
		}

		// For now, just add the new budget to the mock data
		const newBudget: Budget = {
			id: (budgets.length + 1).toString(),
			category: newCategory,
			amount: parseFloat(newAmount),
		};

		setBudgets([...budgets, newBudget]);
		setNewCategory('');
		setNewAmount('');
	};

	useEffect(() => {
		const fetchGoals = async () => {
			const response = await fetch('/api/goals');
			if (response.ok) {
				const data = await response.json();
				setGoals(data);
			}
		};
		fetchGoals();
	}, []);

	if (status === 'loading') {
		return (
			<div className='container mx-auto p-4'>
				<Skeleton className='h-8 w-1/2 mb-4' />
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<Skeleton className='h-[300px]' />
					<Skeleton className='h-[300px]' />
				</div>
				<Skeleton className='h-[200px] mt-6' />
				<Skeleton className='h-[200px] mt-6' />
			</div>
		);
	}

	if (!session) {
		router.push('/auth/signin');
		return null;
	}

	return (
		<div className='container mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>Budget Planning</h1>
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<Card>
					<CardHeader>
						<CardTitle>Add New Budget</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit}>
							<div className='grid w-full items-center gap-4'>
								<div className='flex flex-col space-y-1.5'>
									<Label htmlFor='category'>Category</Label>
									<Input
										id='category'
										value={newCategory}
										onChange={(e) => setNewCategory(e.target.value)}
										required
									/>
								</div>
								<div className='flex flex-col space-y-1.5'>
									<Label htmlFor='amount'>Amount</Label>
									<Input
										id='amount'
										type='number'
										value={newAmount}
										onChange={(e) => setNewAmount(e.target.value)}
										required
									/>
								</div>
							</div>
							{error && <p className='text-red-500 mt-2'>{error}</p>}
							<Button className='w-full mt-6' type='submit'>
								Add Budget
							</Button>
						</form>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Budget Overview</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart data={budgets}>
								<XAxis dataKey='category' />
								<YAxis />
								<Tooltip />
								<Bar dataKey='amount' fill='#8884d8' />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>
			<Card className='mt-6'>
				<CardHeader>
					<CardTitle>Current Budgets</CardTitle>
				</CardHeader>
				<CardContent>
					<ul>
						{budgets.map((budget) => (
							<li key={budget.id} className='mb-2'>
								<span className='font-semibold'>{budget.category}</span>
								<span className='float-right'>${budget.amount.toFixed(2)}</span>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
			<Card className='col-span-1 mt-6'>
				<CardHeader>
					<CardTitle>Related Goals</CardTitle>
				</CardHeader>
				<CardContent>
					<ul>
						{goals.map((goal) => (
							<li key={goal.id} className='mb-2'>
								<span className='font-semibold'>{goal.name}</span>
								<span className='float-right'>
									${goal.targetAmount.toFixed(2)}
								</span>
								<progress
									value={goal.currentAmount}
									max={goal.targetAmount}
									className='w-full'
								></progress>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}
