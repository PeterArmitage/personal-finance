'use client';

import React from 'react';

interface ErrorPageProps {
	error: Error & { digest?: string };
	reset: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, reset }) => {
	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100'>
			<div className='bg-white p-8 rounded-lg shadow-md max-w-md w-full'>
				<h1 className='text-2xl font-bold text-red-600 mb-4'>
					Oops! Something went wrong
				</h1>
				<p className='text-gray-700 mb-4'>Error: {error.message}</p>
				{error.digest && (
					<p className='text-sm text-gray-500 mb-4'>Error ID: {error.digest}</p>
				)}
				<div className='flex flex-col space-y-2'>
					<button
						onClick={reset}
						className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300'
					>
						Try again
					</button>
					<button
						onClick={() => (window.location.href = '/')}
						className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition duration-300'
					>
						Go to Homepage
					</button>
				</div>
			</div>
		</div>
	);
};

export default ErrorPage;
