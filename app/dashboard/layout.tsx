import React from 'react';
import Sidebar from '../components/Sidebar';

interface DashboardLayoutProps {
	children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
	return (
		<div className='flex min-h-screen '>
			<Sidebar />
			<div className='flex-grow flex flex-col'>
				<main className='flex-grow p-4  bg-gradient-light dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 text-gray-800 dark:text-white overflow-auto'>
					{children}
				</main>
			</div>
		</div>
	);
};

export default DashboardLayout;
