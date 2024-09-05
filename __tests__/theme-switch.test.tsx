import React from 'react';
import {
	render,
	screen,
	fireEvent,
	act,
	waitFor,
} from '@testing-library/react';
import { ThemeProvider } from '../app/components/theme-provider';
import { useTheme } from 'next-themes';
import { ThemeSwitch } from '../app/components/theme-switch';

let mockTheme = 'light';
const mockSetTheme = jest.fn((newTheme) => {
	console.log('setTheme called with:', newTheme);
	mockTheme = newTheme;
});

jest.mock('next-themes', () => ({
	useTheme: () => ({
		theme: mockTheme,
		setTheme: mockSetTheme,
	}),
	ThemeProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

// Mock component to access theme
const MockComponent = () => {
	const { theme, setTheme } = useTheme();
	console.log('MockComponent rendering, theme:', theme);
	return (
		<div>
			<span data-testid='current-theme'>{theme}</span>
			<button onClick={() => setTheme('dark')}>Set Dark</button>
			<button onClick={() => setTheme('light')}>Set Light</button>
		</div>
	);
};

describe('ThemeProvider', () => {
	it('renders children', () => {
		render(
			<ThemeProvider>
				<div data-testid='child'>Child component</div>
			</ThemeProvider>
		);
		expect(screen.getByTestId('child')).toBeInTheDocument();
	});

	it('sets initial theme', () => {
		render(
			<ThemeProvider defaultTheme='light'>
				<MockComponent />
			</ThemeProvider>
		);
		expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
	});

	it('changes theme', async () => {
		render(
			<ThemeProvider defaultTheme='light'>
				<MockComponent />
			</ThemeProvider>
		);

		expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

		act(() => {
			screen.getByText('Set Dark').click();
		});

		await waitFor(
			() => {
				expect(mockSetTheme).toHaveBeenCalledWith('dark');
			},
			{ timeout: 1000 }
		);
	});

	it('persists theme across re-renders', async () => {
		const { rerender } = render(
			<ThemeProvider defaultTheme='light'>
				<MockComponent />
			</ThemeProvider>
		);

		act(() => {
			screen.getByText('Set Dark').click();
		});

		rerender(
			<ThemeProvider defaultTheme='light'>
				<MockComponent />
			</ThemeProvider>
		);

		await waitFor(
			() => {
				expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
			},
			{ timeout: 2000 }
		);
	});
});

describe('ThemeSwitch', () => {
	it('renders the theme switch button', () => {
		render(
			<ThemeProvider>
				<ThemeSwitch />
			</ThemeProvider>
		);

		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('changes theme when clicked', async () => {
		render(
			<ThemeProvider>
				<ThemeSwitch />
			</ThemeProvider>
		);

		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();

		fireEvent.click(button);

		await waitFor(
			() => {
				expect(mockSetTheme).toHaveBeenCalledWith('dark');
			},
			{ timeout: 1000 }
		);
	});
});

beforeEach(() => {
	mockTheme = 'light';
});
