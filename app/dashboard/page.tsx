'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DashboardData } from '@/types/index';

export default function Dashboard() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(
		null
	);

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/auth/signin');
		} else if (status === 'authenticated') {
			const fetchDashboardData = async () => {
				const response = await fetch('/api/dashboard');
				if (response.ok) {
					const data = await response.json();
					setDashboardData(data);
				}
			};
			fetchDashboardData();
		}
	}, [status, router]);

	if (status === 'loading') {
		return <div>Loading...</div>;
	}

	if (!session) {
		return null; // This will prevent any flash of unauthenticated content
	}

	return (
		<div className='container mx-auto p-4  bg-gradient-light dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-blue-900'>
			<h1 className='text-2xl font-bold mb-4'>Welcome, {session.user?.name}</h1>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
				<Card>
					<CardHeader>
						<CardTitle>Total Income</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-2xl font-bold'>
							${dashboardData?.totalIncome.toFixed(2) ?? '0.00'}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Total Expenses</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-2xl font-bold'>
							${dashboardData?.totalExpenses.toFixed(2) ?? '0.00'}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Current Balance</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-2xl font-bold'>
							${dashboardData?.currentBalance.toFixed(2) ?? '0.00'}
						</p>
					</CardContent>
				</Card>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<Card>
					<CardHeader>
						<CardTitle>Recent Transactions</CardTitle>
					</CardHeader>
					<CardContent>
						<ul>
							{dashboardData?.recentTransactions.map((transaction) => (
								<li key={transaction.id} className='mb-2'>
									<span className='font-semibold'>
										{transaction.description}
									</span>
									<span
										className={`float-right ${
											transaction.amount >= 0
												? 'text-green-500'
												: 'text-red-500'
										}`}
									>
										${Math.abs(transaction.amount).toFixed(2)}
									</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							<Link href='/dashboard/expenses' className='block w-full'>
								<Button className='w-full'>Add Expense</Button>
							</Link>
							<Link href='/dashboard/income' className='block w-full'>
								<Button className='w-full'>Add Income</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
