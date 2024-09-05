'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeSwitch() {
	const { theme, setTheme } = useTheme();

	return (
		<Button
			variant='ghost'
			size='icon'
			onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
			aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
		>
			{theme === 'light' ? (
				<Moon className='h-6 w-6' />
			) : (
				<Sun className='h-6 w-6' />
			)}
		</Button>
	);
}
