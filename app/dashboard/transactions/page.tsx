'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';

interface Transaction {
	id: string;
	description: string;
	amount: number;
	date: string;
	type: 'income' | 'expense';
	category: string;
}

export default function TransactionsPage() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [filter, setFilter] = useState('all');
	const [sort, setSort] = useState('date');
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);
	const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>(
		{}
	);
	const [editingTransaction, setEditingTransaction] =
		useState<Transaction | null>(null);
	const router = useRouter();
	const { data: session, status } = useSession();

	const fetchTransactions = useCallback(async () => {
		const response = await fetch(
			`/api/transactions?filter=${filter}&sort=${sort}&search=${search}&page=${page}&startDate=${
				startDate?.toISOString() || ''
			}&endDate=${endDate?.toISOString() || ''}`
		);
		if (response.ok) {
			const data = await response.json();
			setTransactions(data.transactions);
			setTotalPages(data.totalPages);
		}
	}, [filter, sort, search, page, startDate, endDate]);

	useEffect(() => {
		if (status === 'authenticated') {
			fetchTransactions();
		}
	}, [status, fetchTransactions]);

	const handleAddTransaction = async () => {
		const response = await fetch('/api/transactions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...newTransaction,
				date: newTransaction.date
					? new Date(newTransaction.date).toISOString()
					: undefined,
			}),
		});
		if (response.ok) {
			setNewTransaction({});
			fetchTransactions();
		}
	};

	const handleEditTransaction = async () => {
		if (!editingTransaction) return;
		const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...editingTransaction,
				date: editingTransaction.date
					? new Date(editingTransaction.date).toISOString()
					: undefined,
			}),
		});
		if (response.ok) {
			setEditingTransaction(null);
			fetchTransactions();
		}
	};

	const handleDeleteTransaction = async (id: string) => {
		const response = await fetch(`/api/transactions/${id}`, {
			method: 'DELETE',
		});
		if (response.ok) {
			fetchTransactions();
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
			<h1 className='text-2xl font-bold mb-4'>Transactions History</h1>
			<div className='mb-4 flex flex-wrap gap-4'>
				<Input
					placeholder='Search transactions'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className='max-w-sm'
				/>
				<Select onValueChange={(value) => setFilter(value)}>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='Filter by' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All</SelectItem>
						<SelectItem value='income'>Income</SelectItem>
						<SelectItem value='expense'>Expense</SelectItem>
					</SelectContent>
				</Select>
				<Select onValueChange={(value) => setSort(value)}>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='Sort by' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='date'>Date</SelectItem>
						<SelectItem value='amount'>Amount</SelectItem>
					</SelectContent>
				</Select>
				<DatePicker date={startDate} setDate={setStartDate} />
				<DatePicker date={endDate} setDate={setEndDate} />
				<Dialog>
					<DialogTrigger asChild>
						<Button>Add Transaction</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add New Transaction</DialogTitle>
						</DialogHeader>
						<Input
							placeholder='Description'
							value={newTransaction.description || ''}
							onChange={(e) =>
								setNewTransaction({
									...newTransaction,
									description: e.target.value,
								})
							}
						/>
						<Input
							type='number'
							placeholder='Amount'
							value={newTransaction.amount || ''}
							onChange={(e) =>
								setNewTransaction({
									...newTransaction,
									amount: parseFloat(e.target.value),
								})
							}
						/>
						<Select
							onValueChange={(value) =>
								setNewTransaction({
									...newTransaction,
									type: value as 'income' | 'expense',
								})
							}
						>
							<SelectTrigger>
								<SelectValue placeholder='Type' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='income'>Income</SelectItem>
								<SelectItem value='expense'>Expense</SelectItem>
							</SelectContent>
						</Select>
						<Input
							placeholder='Category'
							value={newTransaction.category || ''}
							onChange={(e) =>
								setNewTransaction({
									...newTransaction,
									category: e.target.value,
								})
							}
						/>
						<DatePicker
							date={
								newTransaction.date ? new Date(newTransaction.date) : undefined
							}
							setDate={(date) =>
								setNewTransaction({
									...newTransaction,
									date: date?.toISOString(),
								})
							}
						/>
						<Button onClick={handleAddTransaction}>Add Transaction</Button>
					</DialogContent>
				</Dialog>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Transactions</CardTitle>
				</CardHeader>
				<CardContent>
					<ul>
						{transactions.map((transaction) => (
							<li
								key={transaction.id}
								className='mb-2 flex justify-between items-center'
							>
								<span className='font-semibold'>{transaction.description}</span>
								<span className='flex items-center'>
									<span
										className={`mr-2 ${
											transaction.type === 'income'
												? 'text-green-500'
												: 'text-red-500'
										}`}
									>
										{transaction.type === 'income' ? '+' : '-'}$
										{Math.abs(transaction.amount).toFixed(2)}
									</span>
									<span className='text-sm text-gray-500'>
										{new Date(transaction.date).toLocaleDateString()}
									</span>
									<Dialog>
										<DialogTrigger asChild>
											<Button variant='outline' size='sm' className='ml-2'>
												Edit
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Edit Transaction</DialogTitle>
											</DialogHeader>
											<Input
												placeholder='Description'
												value={editingTransaction?.description || ''}
												onChange={(e) =>
													setEditingTransaction({
														...editingTransaction!,
														description: e.target.value,
													})
												}
											/>
											<Input
												type='number'
												placeholder='Amount'
												value={editingTransaction?.amount || ''}
												onChange={(e) =>
													setEditingTransaction({
														...editingTransaction!,
														amount: parseFloat(e.target.value),
													})
												}
											/>
											<Select
												onValueChange={(value) =>
													setEditingTransaction({
														...editingTransaction!,
														type: value as 'income' | 'expense',
													})
												}
											>
												<SelectTrigger>
													<SelectValue placeholder='Type' />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='income'>Income</SelectItem>
													<SelectItem value='expense'>Expense</SelectItem>
												</SelectContent>
											</Select>
											<Input
												placeholder='Category'
												value={editingTransaction?.category || ''}
												onChange={(e) =>
													setEditingTransaction({
														...editingTransaction!,
														category: e.target.value,
													})
												}
											/>
											<DatePicker
												date={
													editingTransaction?.date
														? new Date(editingTransaction.date)
														: undefined
												}
												setDate={(date) =>
													setEditingTransaction({
														...editingTransaction!,
														date: date?.toISOString() || '',
													})
												}
											/>
											<Button onClick={handleEditTransaction}>
												Save Changes
											</Button>
										</DialogContent>
									</Dialog>
									<Button
										variant='destructive'
										size='sm'
										className='ml-2'
										onClick={() => handleDeleteTransaction(transaction.id)}
									>
										Delete
									</Button>
								</span>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
			<div className='mt-4 flex justify-between'>
				<Button onClick={() => setPage(page - 1)} disabled={page === 1}>
					Previous
				</Button>
				<span>
					Page {page} of {totalPages}
				</span>
				<Button
					onClick={() => setPage(page + 1)}
					disabled={page === totalPages}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
