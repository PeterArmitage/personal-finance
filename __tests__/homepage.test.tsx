import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
import { useRouter } from 'next/navigation';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}));

describe('Home page', () => {
	it('renders the welcome message', () => {
		render(<Home />);
		expect(
			screen.getByText('Welcome to Personal Finance Tracker')
		).toBeInTheDocument();
	});

	it('renders the Sign Up link', () => {
		render(<Home />);
		const signUpLink = screen.getByRole('link', { name: /sign up/i });
		expect(signUpLink).toBeInTheDocument();
		expect(signUpLink).toHaveAttribute('href', '/auth/signup');
	});

	it('renders the Sign In link', () => {
		render(<Home />);
		const signInLink = screen.getByRole('link', { name: /sign in/i });
		expect(signInLink).toBeInTheDocument();
		expect(signInLink).toHaveAttribute('href', '/auth/signin');
	});
});
