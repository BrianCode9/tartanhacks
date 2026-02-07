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

export interface BudgetData {
  categories: SpendingCategory[];
  income: number;
  monthlySpending: MonthlySpending[];
  merchants: MerchantSpending[];
  isLoading: boolean;
  isUsingMockData: boolean;
  updateIncome: (income: number) => void;
  updateCategory: (name: string, amount: number) => void;
  updateSubcategory: (categoryName: string, subcategoryName: string, amount: number) => void;
}

export function useBudgetData(userId?: string): BudgetData {
  const [state, setState] = useState<Omit<BudgetData, "updateIncome" | "updateCategory" | "updateSubcategory">>({
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
        // Fetch transactions for the user
        const res = await fetch(`/api/transactions?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch transactions");

        const transactions: (Transaction & { merchant: Merchant })[] = await res.json();

        if (!transactions || transactions.length === 0) {
          throw new Error("No transactions found");
        }

        // Transform data
        const categories = transformTransactionsToCategories(transactions);
        const monthlySpending = calculateMonthlySpending(transactions);
        const merchants = calculateMerchantSpending(transactions);

        // Calculate income as total positive balance (simplified for now)
        const income = mockIncome; // Could fetch from accounts in the future

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

  return { ...state, updateIncome, updateCategory, updateSubcategory };
}
