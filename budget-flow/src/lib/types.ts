// Nessie API Types
export interface NessieCustomer {
  _id: string;
  first_name: string;
  last_name: string;
  address: {
    street_number: string;
    street_name: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface NessieAccount {
  _id: string;
  type: "Checking" | "Savings" | "Credit Card";
  nickname: string;
  rewards: number;
  balance: number;
  account_number: string;
  customer_id: string;
}

export interface NessiePurchase {
  _id: string;
  merchant_id: string;
  medium: "balance" | "rewards";
  purchase_date: string;
  amount: number;
  status: "pending" | "cancelled" | "completed";
  description: string;
}

export interface NessieMerchant {
  _id: string;
  name: string;
  category: string[];
  address: {
    street_number: string;
    street_name: string;
    city: string;
    state: string;
    zip: string;
  };
  geocode: {
    lat: number;
    lng: number;
  };
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
