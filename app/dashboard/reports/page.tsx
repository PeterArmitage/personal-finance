'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from 'recharts';

interface FinancialData {
	incomeByCategory: { [key: string]: number };
	expensesByCategory: { [key: string]: number };
	monthlyBalance: { month: string; balance: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsPage() {
	const [financialData, setFinancialData] = useState<FinancialData | null>(
		null
	);
	const [timeFrame, setTimeFrame] = useState('month');
	const router = useRouter();
	const { data: session, status } = useSession();

	const fetchFinancialData = useCallback(async () => {
		try {
			const response = await fetch(`/api/reports?timeFrame=${timeFrame}`);
			if (!response.ok) {
				throw new Error('Failed to fetch financial data');
			}
			const data = await response.json();
			setFinancialData(data);
		} catch (error) {
			console.error('Error fetching financial data:', error);
			// Optionally, you can set an error state here to display to the user
		}
	}, [timeFrame]);

	useEffect(() => {
		if (status === 'authenticated') {
			fetchFinancialData();
		}
	}, [status, fetchFinancialData]);

	if (status === 'loading') {
		return <div>Loading...</div>;
	}

	if (status === 'unauthenticated') {
		router.push('/auth/signin');
		return null;
	}

	return (
		<div className='container mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>Financial Reports</h1>
			<div className='mb-4'>
				<Select onValueChange={(value) => setTimeFrame(value)}>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='Select time frame' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='month'>This Month</SelectItem>
						<SelectItem value='year'>This Year</SelectItem>
						<SelectItem value='all'>All Time</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				<Card>
					<CardHeader>
						<CardTitle>Income by Category</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<PieChart>
								<Pie
									data={Object.entries(
										financialData?.incomeByCategory || {}
									).map(([name, value]) => ({ name, value }))}
									dataKey='value'
									nameKey='name'
									cx='50%'
									cy='50%'
									outerRadius={80}
									fill='#8884d8'
									label
								>
									{Object.entries(financialData?.incomeByCategory || {}).map(
										(entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
										)
									)}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Expenses by Category</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<PieChart>
								<Pie
									data={Object.entries(
										financialData?.expensesByCategory || {}
									).map(([name, value]) => ({ name, value }))}
									dataKey='value'
									nameKey='name'
									cx='50%'
									cy='50%'
									outerRadius={80}
									fill='#8884d8'
									label
								>
									{Object.entries(financialData?.expensesByCategory || {}).map(
										(entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
										)
									)}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
				<Card className='md:col-span-2'>
					<CardHeader>
						<CardTitle>Monthly Balance</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart data={financialData?.monthlyBalance || []}>
								<XAxis dataKey='month' />
								<YAxis />
								<Tooltip />
								<Bar dataKey='balance' fill='#8884d8' />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
