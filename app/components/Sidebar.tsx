'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ThemeSwitch } from './theme-switch';

const Sidebar: React.FC = () => {
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut({ redirect: false });
		router.push('/');
	};

	return (
		<nav className='w-64 bg-gradient-light dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-blue-900-800 p-4 flex flex-col min-h-screen'>
			<ThemeSwitch />
			<ul className='flex-grow space-y-2'>
				<li>
					<Link
						href='/dashboard'
						className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
					>
						Overview
					</Link>
				</li>
				<li>
					<Link
						href='/dashboard/expenses'
						className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
					>
						Expenses
					</Link>
				</li>
				<li>
					<Link
						href='/dashboard/income'
						className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
					>
						Income
					</Link>
				</li>
				<li>
					<Link
						href='/dashboard/budget'
						className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
					>
						Budget
					</Link>
				</li>
				<li>
					<Link
						href='/dashboard/goals'
						className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
					>
						Goals
					</Link>
				</li>
				<li>
					<Link
						href='/dashboard/reports'
						className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
					>
						Reports
					</Link>
				</li>
				<li>
					<Link
						href='/dashboard/transactions'
						className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
					>
						Transactions
					</Link>
				</li>
			</ul>
			<div className='mt-auto'>
				<button
					onClick={handleSignOut}
					className='w-full bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded'
				>
					Sign Out
				</button>
			</div>
		</nav>
	);
};

export default Sidebar;
