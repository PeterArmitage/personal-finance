import { User, Expense, Income } from '@prisma/client';

export interface DashboardData {
	totalIncome: number;
	totalExpenses: number;
	currentBalance: number;
	recentTransactions: Array<{
		id: string;
		description: string;
		amount: number;
		date: string;
	}>;
}

export interface NextAuthUser extends User {
	expenses?: any[];
	incomes?: any[];
}
