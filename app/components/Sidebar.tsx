'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ThemeSwitch } from './theme-switch';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Sidebar: React.FC = () => {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const handleSignOut = async () => {
		await signOut({ redirect: false });
		router.push('/');
	};

	const toggleSidebar = () => setIsOpen(!isOpen);

	return (
		<>
			<Button
				className='lg:hidden fixed top-4 right-4 z-50'
				onClick={toggleSidebar}
				variant='outline'
				size='icon'
			>
				{isOpen ? <X className='h-4 w-4' /> : <Menu className='h-4 w-4' />}
			</Button>
			<nav
				className={`fixed inset-y-0 left-0 transform ${
					isOpen ? 'translate-x-0' : '-translate-x-full'
				} lg:relative lg:translate-x-0 transition duration-200 ease-in-out lg:flex lg:w-64 bg-background border-r border-border z-40 h-full overflow-y-auto flex flex-col`}
			>
				<div className='flex flex-col h-full p-4 bg-gradient-light dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-blue-900'>
					<div className='hidden lg:block mb-6'>
						<ThemeSwitch />
					</div>
					<ul className='flex-grow space-y-2'>
						<li>
							<Link
								href='/dashboard'
								className='text-foreground hover:text-primary block py-2'
								onClick={() => setIsOpen(false)}
							>
								Overview
							</Link>
						</li>
						<li>
							<Link
								href='/dashboard/expenses'
								className='text-foreground hover:text-primary block py-2'
								onClick={() => setIsOpen(false)}
							>
								Expenses
							</Link>
						</li>
						<li>
							<Link
								href='/dashboard/income'
								className='text-foreground hover:text-primary block py-2'
								onClick={() => setIsOpen(false)}
							>
								Income
							</Link>
						</li>
						<li>
							<Link
								href='/dashboard/budget'
								className='text-foreground hover:text-primary block py-2'
								onClick={() => setIsOpen(false)}
							>
								Budget
							</Link>
						</li>
						<li>
							<Link
								href='/dashboard/goals'
								className='text-foreground hover:text-primary block py-2'
								onClick={() => setIsOpen(false)}
							>
								Goals
							</Link>
						</li>
						<li>
							<Link
								href='/dashboard/reports'
								className='text-foreground hover:text-primary block py-2'
								onClick={() => setIsOpen(false)}
							>
								Reports
							</Link>
						</li>
						<li>
							<Link
								href='/dashboard/transactions'
								className='text-foreground hover:text-primary block py-2'
								onClick={() => setIsOpen(false)}
							>
								Transactions
							</Link>
						</li>
					</ul>
					<div className='mt-auto pt-4'>
						<Button
							onClick={handleSignOut}
							className='w-full'
							variant='outline'
						>
							Sign Out
						</Button>
					</div>
				</div>
			</nav>
		</>
	);
};

export default Sidebar;
