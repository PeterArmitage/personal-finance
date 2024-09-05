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
export interface Budget {
	id: string;
	category: string;
	amount: number;
}
export interface DashboardLayoutProps {
	children: React.ReactNode;
}

export interface Goal {
	id: string;
	name: string;
	targetAmount: number;
	currentAmount: number;
	deadline: string;
}
