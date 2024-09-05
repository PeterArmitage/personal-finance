import Sidebar from '@/app/components/Sidebar';
import { ThemeSwitch } from '@/app/components/theme-switch';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='flex h-screen overflow-hidden bg-background bg-gradient-light dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-blue-900'>
			<Sidebar />
			<div className='flex-1 flex flex-col overflow-hidden'>
				<header className='lg:hidden p-4 border-b border-border'>
					<ThemeSwitch />
				</header>
				<main className='flex-1 overflow-y-auto p-4 lg:p-8'>{children}</main>
			</div>
		</div>
	);
}
