export type CategoryType = 'monthly' | 'weekly' | 'both';

export interface Category {
  id: string;
  name: string;
  icon: string; // Icon identifier (e.g. name of MaterialCommunityIcons)
  color: string; // Hex color code
  type: CategoryType;
  isSystem: boolean; // Pre-installed system defaults
}

export interface MonthlyExpense {
  id: string;
  planId: string;
  categoryName: string;
  plannedAmount: number;
  notes?: string;
}

export interface MonthlyPlan {
  id: string;
  month: string; // YYYY-MM
  income: number;
  expenses: MonthlyExpense[];
  createdAt?: string;
}

export interface WeeklyExpense {
  id: string;
  planId: string;
  categoryName: string;
  plannedAmount: number;
  notes?: string;
}

export interface WeeklyPlan {
  id: string;
  startDate: string; // YYYY-MM-DD (Monday)
  endDate: string;   // YYYY-MM-DD (Sunday)
  income: number;
  expenses: WeeklyExpense[];
  createdAt?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  createdAt?: string;
}

export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  status: 'success' | 'warning' | 'info';
  category?: string;
}

export interface SimulationItem {
  id: string;
  categoryName: string;
  amount: number;
}

export interface Installment {
  id: string;
  name: string;
  amount: number;
  startMonth: string; // YYYY-MM
  endMonth: string;   // YYYY-MM
}

export interface WalletIncome {
  id: string;
  walletId: string;
  categoryName: string;
  amount: number;
  notes?: string;
}

export interface WalletExpense {
  id: string;
  walletId: string;
  categoryName: string;
  plannedAmount: number;
  notes?: string;
}

export interface DigitalWallet {
  id: string;
  name: string; // e.g., GoPay, ShopeePay, DANA, SeaBank, Bank Jago
  balance: number;
  incomes?: WalletIncome[];
  expenses: WalletExpense[];
  updatedAt?: string;
}
