// Database Model Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  nickname: string;
  balance: number;
  createdAt: Date;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  merchantId: string;
  amount: number;
  description?: string;
  transactionDate: Date;
  status: string;
  createdAt: Date;
  merchant?: Merchant;
}

// App Types
export interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
  subcategories: { name: string; amount: number }[];
}

export interface BudgetSankeyData {
  nodes: { name: string; color?: string }[];
  links: { source: number; target: number; value: number }[];
}

export interface StrategyNode {
  id: string;
  type: "income" | "goal" | "strategy" | "suggestion" | "warning";
  label: string;
  description: string;
  amount?: number;
}

export interface StrategyEdge {
  source: string;
  target: string;
  label?: string;
}

export interface MonthlySpending {
  month: string;
  amount: number;
}

export interface MerchantSpending {
  name: string;
  amount: number;
  category: string;
  visits: number;
}

// Planner Types
export interface DailySpending {
  date: string; // YYYY-MM-DD
  amount: number;
  transactions: number;
}

export interface PlannedEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  estimatedCost: number;
  category: "vacation" | "holiday" | "purchase" | "event" | "other";
  notes?: string;
}

// Debt Payoff Types
export type DebtType = "credit-card" | "student-loan" | "car-loan" | "medical" | "personal-loan";

export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  type: DebtType;
}

export type DebtStrategy = "snowball" | "avalanche" | "hybrid" | "custom";

export interface DebtPayoffScheduleItem {
  debtId: string;
  monthsToPayoff: number;
  totalInterestPaid: number;
  payoffDate: string;
  monthlyPayment: number;
  cumulativePayment: number;
}

export interface DebtPayoffResult {
  strategy: DebtStrategy;
  order: string[];
  schedule: DebtPayoffScheduleItem[];
  totalInterestPaid: number;
  totalMonthsToDebtFree: number;
  totalAmountPaid: number;
}

export interface DebtUserProfile {
  extraMonthlyPayment: number;
  impulsivityScore: number;
}
