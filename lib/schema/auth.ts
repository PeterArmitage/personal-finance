import { z } from 'zod';

export const SignUpSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const CredentialsSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required'),
});

export const DashboardResponseSchema = z.object({
	totalIncome: z.number(),
	totalExpenses: z.number(),
	currentBalance: z.number(),
	recentTransactions: z.array(
		z.object({
			id: z.string(),
			description: z.string(),
			amount: z.number(),
			date: z.string(),
		})
	),
});

export const GoalSchema = z.object({
	name: z.string().min(1),
	category: z.string().min(1),
	targetAmount: z.number().positive(),
	deadline: z.string().refine((date) => !isNaN(Date.parse(date)), {
		message: 'Invalid date format',
	}),
});

export const UpdateGoalSchema = z.object({
	id: z.string(),
	currentAmount: z.number().min(0),
});
