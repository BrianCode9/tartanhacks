"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import CalendarHeatmap from "@/components/CalendarHeatmap";
import { generateDailySpending } from "@/lib/mock-data";
import { DailySpending } from "@/lib/types";

export default function SpendingHistoryPage() {
  const [dailySpending, setDailySpending] = useState<DailySpending[]>([]);

  // Generate spending data on client only to avoid hydration mismatch
  useEffect(() => {
    setDailySpending(generateDailySpending());
  }, []);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    if (dailySpending.length === 0) return [];

    const monthlyData: Record<string, { total: number; days: number; transactions: number }> = {};

    dailySpending.forEach((day) => {
      const monthKey = day.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, days: 0, transactions: 0 };
      }
      monthlyData[monthKey].total += day.amount;
      monthlyData[monthKey].days += 1;
      monthlyData[monthKey].transactions += day.transactions;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        label: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        total: data.total,
        avgDaily: data.total / data.days,
        transactions: data.transactions,
        days: data.days,
      }))
      .sort((a, b) => b.month.localeCompare(a.month)); // Most recent first
  }, [dailySpending]);

  // Current month vs previous month comparison
  const comparison = useMemo(() => {
    if (monthlyStats.length < 2) return null;
    const current = monthlyStats[0];
    const previous = monthlyStats[1];
    const diff = current.total - previous.total;
    const percentChange = previous.total > 0 ? ((diff / previous.total) * 100) : 0;
    return { current, previous, diff, percentChange };
  }, [monthlyStats]);



  // Show loading state while data loads
  if (dailySpending.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading spending history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Spending History</h1>
        <p className="text-text-secondary">
          Visualize your spending patterns over the past year
        </p>
      </div>

      {/* Month Comparison */}
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-bg-card rounded-xl p-5 border border-border-main">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-accent-blue" />
              <span className="text-sm font-medium text-text-secondary">This Month</span>
            </div>
            <p className="text-3xl font-bold text-text-primary">
              ${comparison.current.total.toLocaleString()}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {comparison.current.transactions} transactions
            </p>
          </div>

          <div className="bg-bg-card rounded-xl p-5 border border-border-main">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-text-secondary" />
              <span className="text-sm font-medium text-text-secondary">Last Month</span>
            </div>
            <p className="text-3xl font-bold text-text-primary">
              ${comparison.previous.total.toLocaleString()}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {comparison.previous.transactions} transactions
            </p>
          </div>

          <div className={`rounded-xl p-5 border ${comparison.diff <= 0 ? "bg-accent-green/10 border-accent-green/20" : "bg-accent-red/10 border-accent-red/20"}`}>
            <div className="flex items-center gap-2 mb-3">
              {comparison.diff <= 0 ? (
                <TrendingDown className="w-5 h-5 text-accent-green" />
              ) : (
                <TrendingUp className="w-5 h-5 text-accent-red" />
              )}
              <span className="text-sm font-medium text-text-secondary">Change</span>
            </div>
            <p className={`text-3xl font-bold ${comparison.diff <= 0 ? "text-accent-green" : "text-accent-red"}`}>
              {comparison.diff <= 0 ? "-" : "+"}${Math.abs(comparison.diff).toLocaleString()}
            </p>
            <p className={`text-sm mt-1 ${comparison.diff <= 0 ? "text-accent-green" : "text-accent-red"}`}>
              {comparison.percentChange >= 0 ? "+" : ""}{comparison.percentChange.toFixed(1)}% from last month
            </p>
          </div>
        </div>
      )}

      {/* Heatmap Legend */}
      <div className="bg-bg-card rounded-xl p-6 border border-border-main mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Daily Spending Heatmap</h2>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-text-secondary">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-amber-400" />
              <span className="text-text-secondary">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-rose-500" />
              <span className="text-text-secondary">High</span>
            </div>
          </div>
        </div>

        {/* Calendar Heatmap */}
        <CalendarHeatmap data={dailySpending} />
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-bg-card rounded-xl p-6 border border-border-main">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-accent-purple" />
          <h2 className="text-lg font-semibold text-text-primary">Monthly Breakdown</h2>
        </div>

        <div className="space-y-3">
          {monthlyStats.map((month, index) => {
            const maxTotal = Math.max(...monthlyStats.map((m) => m.total));
            const barWidth = maxTotal > 0 ? (month.total / maxTotal) * 100 : 0;
            const isCurrentMonth = index === 0;

            return (
              <div key={month.month} className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isCurrentMonth ? "text-accent-blue" : "text-text-primary"}`}>
                    {month.label}
                    {isCurrentMonth && <span className="ml-2 text-xs text-accent-blue">(Current)</span>}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-text-primary">
                      ${month.total.toLocaleString()}
                    </span>
                    <span className="text-xs text-text-secondary ml-2">
                      (avg ${month.avgDaily.toFixed(0)}/day)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isCurrentMonth ? "bg-accent-blue" : "bg-accent-purple/60"}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
