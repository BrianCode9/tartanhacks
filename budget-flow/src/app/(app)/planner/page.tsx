"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
} from "lucide-react";
import CalendarHeatmap from "@/components/CalendarHeatmap";
import { calculateDailyBudget } from "@/lib/mock-data";
import { DailySpending, Transaction, Merchant } from "@/lib/types";
import { useBudgetData } from "@/lib/use-budget-data";
import { useUser } from "@/lib/user-context";
import { calculateDailySpending } from "@/lib/data-transform";

export default function PlannerPage() {
  const { user } = useUser();
  const { categories, income, isLoading: budgetLoading } = useBudgetData(user?.id);

  const [selectedDay, setSelectedDay] = useState<DailySpending | null>(null);
  const [dailySpending, setDailySpending] = useState<DailySpending[]>([]);

  // Fetch transactions and calculate daily spending
  useEffect(() => {
    if (!user?.id) return;

    fetch(`/api/transactions?userId=${user.id}`)
      .then(res => res.json())
      .then((transactions: (Transaction & { merchant: Merchant })[]) => {
        const daily = calculateDailySpending(transactions);
        setDailySpending(daily);
      })
      .catch(err => console.error('Failed to fetch transactions:', err));
  }, [user?.id]);

  // Calculate fixed expenses (housing, insurance, etc.) from REAL categories
  const fixedExpenses = categories
    .filter((c) => ["Housing", "Health"].includes(c.name))
    .reduce((sum, c) => sum + c.amount, 0);

  // Days until end of month
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const budgetInfo = calculateDailyBudget(income, fixedExpenses, daysRemaining);

  // Spending stats
  const last7Days = dailySpending.slice(-7);
  const last7DaysTotal = last7Days.reduce((sum, d) => sum + d.amount, 0);
  const avgDailySpending = last7DaysTotal / 7;
  const isOverBudget = avgDailySpending > budgetInfo.adjustedForEvents;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-text-primary">Budget Planner</h1>
        <p className="text-text-secondary mt-2">Track your daily spending and stay on budget</p>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Budget Card */}
        <div className="bg-bg-card border border-border-main rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent-blue/20 rounded-lg">
              <Target className="w-5 h-5 text-accent-blue" />
            </div>
            <p className="text-sm text-text-secondary">Daily Budget</p>
          </div>
          <p className="text-3xl font-bold text-text-primary">${budgetInfo.dailyBudget.toFixed(2)}</p>
          <p className="text-xs text-text-secondary mt-1">Based on monthly income</p>
        </div>

        {/* Average Spending Card */}
        <div className={`bg-bg-card border border-border-main rounded-xl p-6 shadow-sm ${isOverBudget ? 'ring-2 ring-accent-red/30' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-accent-red/20' : 'bg-accent-green/20'}`}>
              {isOverBudget ? (
                <TrendingUp className="w-5 h-5 text-accent-red" />
              ) : (
                <TrendingDown className="w-5 h-5 text-accent-green" />
              )}
            </div>
            <p className="text-sm text-text-secondary">Avg. Daily (7d)</p>
          </div>
          <p className={`text-3xl font-bold ${isOverBudget ? 'text-accent-red' : 'text-accent-green'}`}>
            ${avgDailySpending.toFixed(2)}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {isOverBudget ? (
              <span className="text-accent-red">Over budget</span>
            ) : (
              <span className="text-accent-green">Under budget</span>
            )}
          </p>
        </div>

        {/* Days Remaining Card */}
        <div className="bg-bg-card border border-border-main rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent-purple/20 rounded-lg">
              <Target className="w-5 h-5 text-accent-purple" />
            </div>
            <p className="text-sm text-text-secondary">Days Left</p>
          </div>
          <p className="text-3xl font-bold text-text-primary">{daysRemaining}</p>
          <p className="text-xs text-text-secondary mt-1">Until end of month</p>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="bg-bg-card border border-border-main rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Spending Calendar</h2>
            <p className="text-sm text-text-secondary mt-1">Click a day to view transactions</p>
          </div>
        </div>

        {budgetLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
          </div>
        ) : (
          <CalendarHeatmap
            data={dailySpending}
            onDayClick={setSelectedDay}
          />
        )}
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="bg-bg-card border border-border-main rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {selectedDay.date} - ${selectedDay.amount.toFixed(2)}
          </h3>
          <p className="text-sm text-text-secondary">
            {selectedDay.transactions} transaction{selectedDay.transactions !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-text-secondary mt-2">
            View full transaction details on the dashboard
          </p>
        </div>
      )}
    </div>
  );
}
