import Link from 'next/link';
import { ThemeSwitch } from './components/theme-switch';

export const metadata = {
	title: 'Finance Tracker',
	description:
		'Take control of your finances with our easy-to-use tracking and budgeting tools.',
};

export default function Home() {
	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-gradient-light dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-blue-900'>
			<div className='absolute top-4 right-4'>
				<ThemeSwitch />
			</div>
			<main className='text-center text-gray-800 dark:text-gray-200'>
				<h1 className='text-4xl font-bold mb-4'>
					Welcome to Personal Finance Tracker
				</h1>
				<p className='mb-8'>
					Take control of your finances with our easy-to-use tracking and
					budgeting tools.
				</p>
				<div className='space-x-4'>
					<Link
						href='/auth/signup'
						className='bg-transparent hover:bg-blue-400 dark:hover:bg-gray-600 text-slate-800 dark:text-white font-bold py-2 px-4 rounded'
					>
						Sign Up
					</Link>
					<Link
						href='/auth/signin'
						className='bg-transparent hover:bg-blue-400  dark:hover:bg-gray-600 text-slate-800 dark:text-white font-bold py-2 px-4 rounded'
					>
						Sign In
					</Link>
				</div>
			</main>
		</div>
	);
}
