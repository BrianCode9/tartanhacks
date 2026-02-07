"use client";

import { useState, useEffect } from "react";
import {
  SpendingCategory,
  MonthlySpending,
  MerchantSpending,
  NessieCustomer,
  NessieAccount,
  NessiePurchase,
  NessieMerchant,
} from "./types";
import { transformNessieData } from "./nessie-transform";
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
  updateCategory: (name: string, amount: number) => void;
  updateSubcategory: (categoryName: string, subcategoryName: string, amount: number) => void;
}

async function fetchNessie<T>(path: string): Promise<T> {
  const res = await fetch(`/api/nessie?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`Nessie API error: ${res.status}`);
  return res.json();
}

export function useBudgetData(): BudgetData {
  const [state, setState] = useState<Omit<BudgetData, "updateCategory" | "updateSubcategory">>({
    categories: [],
    income: 0,
    monthlySpending: [],
    merchants: [],
    isLoading: true,
    isUsingMockData: false,
  });

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
      try {
        // 1. Get customers
        const customers = await fetchNessie<NessieCustomer[]>("/customers");
        if (!customers || customers.length === 0) throw new Error("No customers found");

        const customerId = customers[0]._id;

        // 2. Get accounts for first customer
        const accounts = await fetchNessie<NessieAccount[]>(
          `/customers/${customerId}/accounts`
        );
        if (!accounts || accounts.length === 0) throw new Error("No accounts found");

        // Pick the first checking account, or first account if no checking
        const checkingAccount =
          accounts.find((a) => a.type === "Checking") || accounts[0];

        // 3. Get purchases for the account
        const purchases = await fetchNessie<NessiePurchase[]>(
          `/accounts/${checkingAccount._id}/purchases`
        );

        if (!purchases || purchases.length === 0) throw new Error("No purchases found");

        // 4. Get all merchants for category enrichment
        const merchants = await fetchNessie<NessieMerchant[]>("/merchants");
        const merchantsById = new Map<string, NessieMerchant>();
        if (merchants) {
          for (const m of merchants) {
            merchantsById.set(m._id, m);
          }
        }

        // 5. Transform data
        const transformed = transformNessieData(
          purchases,
          merchantsById,
          checkingAccount.balance
        );

        if (!cancelled) {
          setState({
            categories: transformed.categories,
            income: transformed.income,
            monthlySpending: transformed.monthlySpending,
            merchants: transformed.merchants,
            isLoading: false,
            isUsingMockData: false,
          });
        }
      } catch (error) {
        console.warn("Failed to fetch Nessie data, using mock data:", error);
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
  }, []);

  return { ...state, updateCategory, updateSubcategory };
}
