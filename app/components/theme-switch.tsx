'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeSwitch() {
	const [mounted, setMounted] = useState(false);
	const { setTheme, theme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<Button
			variant='ghost'
			size='icon'
			onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
			className='bg:none hover:bg-white/20 dark:hover:bg-white/10'
		>
			{theme === 'dark' ? (
				<Sun className='h-6 w-6 text-yellow-400 hover:text-yellow-200 transition-colors' />
			) : (
				<Moon className='h-6 w-6 text-blue-500 hover:text-blue-300 transition-colors' />
			)}
		</Button>
	);
}
