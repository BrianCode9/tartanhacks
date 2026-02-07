"use client";

import { useState, useEffect } from "react";
import {
  SpendingCategory,
  MonthlySpending,
  MerchantSpending,
  Transaction,
  Merchant,
} from "./types";
import {
  transformTransactionsToCategories,
  calculateMonthlySpending,
  calculateMerchantSpending,
} from "./data-transform";
import {
  mockCategories,
  mockIncome,
  mockMonthlySpending,
  mockMerchants,
} from "./mock-data";
import { useUser } from "./user-context";

export interface BudgetData {
  categories: SpendingCategory[];
  income: number;
  monthlySpending: MonthlySpending[];
  merchants: MerchantSpending[];
  isLoading: boolean;
  isUsingMockData: boolean;
  updateIncome: (income: number) => void;
  addCategory: (category: SpendingCategory) => void;
  removeCategory: (name: string) => void;
  updateCategoryColor: (name: string, color: string) => void;
  updateCategory: (name: string, amount: number) => void;
  updateSubcategory: (categoryName: string, subcategoryName: string, amount: number) => void;
}

export function useBudgetData(userIdParam?: string): BudgetData {
  const { user } = useUser();
  const userId = userIdParam || user?.id;
  const [state, setState] = useState<Omit<BudgetData, "updateIncome" | "addCategory" | "removeCategory" | "updateCategoryColor" | "updateCategory" | "updateSubcategory">>({
    categories: [],
    income: 0,
    monthlySpending: [],
    merchants: [],
    isLoading: true,
    isUsingMockData: false,
  });

  const updateIncome = (income: number) => {
    setState((prev) => ({ ...prev, income }));
  };

  const addCategory = (category: SpendingCategory) => {
    setState((prev) => {
      const exists = prev.categories.some(
        (c) => c.name.trim().toLowerCase() === category.name.trim().toLowerCase()
      );
      if (exists) return prev;
      return { ...prev, categories: [...prev.categories, category] };
    });
  };

  const removeCategory = (name: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.name !== name),
    }));
  };

  const updateCategoryColor = (name: string, color: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.name === name ? { ...c, color } : c)),
    }));
  };

  const updateCategory = (name: string, amount: number) => {
    setState((prev) => {
      const newCategories = prev.categories.map((cat) => {
        if (cat.name === name) {
          // Scale subcategories proportionally
          const ratio = cat.amount > 0 ? amount / cat.amount : 0;
          const newSubs = cat.subcategories.map((sub) => ({
            ...sub,
            amount: Math.round(sub.amount * ratio),
          }));
          return { ...cat, amount, subcategories: newSubs };
        }
        return cat;
      });
      return { ...prev, categories: newCategories };
    });
  };

  const updateSubcategory = (categoryName: string, subcategoryName: string, amount: number) => {
    setState((prev) => {
      const newCategories = prev.categories.map((cat) => {
        if (cat.name === categoryName) {
          const newSubs = cat.subcategories.map((sub) => {
            if (sub.name === subcategoryName) {
              return { ...sub, amount };
            }
            return sub;
          });
          // Recalculate total amount for the category
          const newTotal = newSubs.reduce((sum, sub) => sum + sub.amount, 0);
          return { ...cat, amount: newTotal, subcategories: newSubs };
        }
        return cat;
      });
      return { ...prev, categories: newCategories };
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      // If no userId provided, use mock data
      if (!userId) {
        setState({
          categories: mockCategories,
          income: mockIncome,
          monthlySpending: mockMonthlySpending,
          merchants: mockMerchants,
          isLoading: false,
          isUsingMockData: true,
        });
        return;
      }

      try {
        // Fetch user data to get monthly income
        const userRes = await fetch(`/api/auth/user?userId=${userId}`);
        if (!userRes.ok) throw new Error("Failed to fetch user data");
        const userData = await userRes.json();

        // Fetch transactions for the user (from ALL accounts)
        const res = await fetch(`/api/transactions?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch transactions");

        const transactions: (Transaction & { merchant: Merchant })[] = await res.json();

        if (!transactions || transactions.length === 0) {
          throw new Error("No transactions found");
        }

        // Get the current month's date range
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Filter to only current month transactions
        const currentMonthTransactions = transactions.filter(transaction => {
          const date = new Date(transaction.transactionDate);
          return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
        });

        // Transform data using current month transactions for categories and merchants
        const categories = transformTransactionsToCategories(currentMonthTransactions);
        const monthlySpending = calculateMonthlySpending(transactions); // Keep all for trend chart
        const merchants = calculateMerchantSpending(currentMonthTransactions);

        // Use monthly income from user profile
        const income = Number(userData.monthlyIncome) || mockIncome;

        if (!cancelled) {
          setState({
            categories,
            income,
            monthlySpending,
            merchants,
            isLoading: false,
            isUsingMockData: false,
          });
        }
      } catch (error) {
        console.warn("Failed to fetch database data, using mock data:", error);
        if (!cancelled) {
          setState({
            categories: mockCategories,
            income: mockIncome,
            monthlySpending: mockMonthlySpending,
            merchants: mockMerchants,
            isLoading: false,
            isUsingMockData: true,
          });
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { ...state, updateIncome, addCategory, removeCategory, updateCategoryColor, updateCategory, updateSubcategory };
}
