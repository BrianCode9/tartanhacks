"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SankeyDiagram from "@/components/SankeyDiagram";
import CategoryCard from "@/components/CategoryCard";
import { buildSankeyData } from "@/lib/mock-data";
import { useBudgetData } from "@/lib/use-budget-data";
import {
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Database,
  AlertTriangle,
  Target,
  CalendarDays,
  Plus,
  Check,
  X,
  Edit2,
} from "lucide-react";

function parseCurrencyLikeInput(value: string): number {
  // Accept inputs like "5000", "$5,000", "5,000.25".
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

const CATEGORY_COLOR_PALETTE = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#ef4444", // red
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#22c55e", // green
  "#eab308", // yellow
];

function pickNextCategoryColor(used: string[]): string {
  const usedSet = new Set(used.map((c) => c.toLowerCase()));
  const next = CATEGORY_COLOR_PALETTE.find((c) => !usedSet.has(c.toLowerCase()));
  return next ?? CATEGORY_COLOR_PALETTE[0];
}

function EditableIncome({
  income,
  onChangeIncome,
}: {
  income: number;
  onChangeIncome: (val: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempIncome, setTempIncome] = useState<string>(String(income));
  const initialIncomeRef = useRef<number>(income);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) setTempIncome(String(income));
  }, [income, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const commit = () => {
    const parsed = parseCurrencyLikeInput(tempIncome);
    if (Number.isFinite(parsed) && parsed >= 0) {
      onChangeIncome(Math.round(parsed));
      setIsEditing(false);
      return;
    }

    // Invalid input: revert to the pre-edit value.
    onChangeIncome(initialIncomeRef.current);
    setTempIncome(String(initialIncomeRef.current));
    setIsEditing(false);
  };

  const cancel = () => {
    onChangeIncome(initialIncomeRef.current);
    setTempIncome(String(initialIncomeRef.current));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <span>$</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          aria-label="Monthly Income"
          value={tempIncome}
          onChange={(e) => {
            const next = e.target.value;
            setTempIncome(next);

            // Live update Sankey while typing (valid numbers only).
            const parsed = parseCurrencyLikeInput(next);
            if (Number.isFinite(parsed) && parsed >= 0) {
              onChangeIncome(Math.round(parsed));
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
              (e.currentTarget as HTMLInputElement).blur();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              cancel();
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
          className="w-28 px-1 py-0.5 bg-bg-main border border-border-main rounded text-text-primary text-2xl font-bold focus:outline-none focus:border-accent-blue"
        />
        <button
          onClick={commit}
          className="p-0.5 hover:bg-accent-green/20 rounded text-accent-green"
          aria-label="Save income"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={cancel}
          className="p-0.5 hover:bg-accent-red/20 rounded text-accent-red"
          aria-label="Cancel income edit"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        initialIncomeRef.current = income;
        setTempIncome(String(income));
        setIsEditing(true);
      }}
      className="cursor-pointer hover:bg-bg-main px-1 py-0.5 rounded transition-colors group/edit inline-flex items-center gap-1"
      title="Click to edit"
    >
      <span>${income.toLocaleString()}</span>
      <Edit2 className="w-4 h-4 text-text-muted opacity-0 group-hover/edit:opacity-100 transition-opacity" />
    </div>
  );
}

export default function DashboardPage() {
  const { categories, income, isLoading, isUsingMockData, updateIncome, addCategory, removeCategory, updateCategoryColor, updateSubcategory } = useBudgetData();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryAmount, setNewCategoryAmount] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState<string>("");
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!showAddCategory) {
      setAddCategoryError(null);
      setNewCategoryName("");
      setNewCategoryAmount("");
      setNewCategoryColor("");
    } else {
      setNewCategoryColor((c) =>
        c || pickNextCategoryColor(categories.map((cat) => cat.color))
      );
    }
  }, [showAddCategory, categories]);

  const sankeyData = useMemo(
    () => (categories.length > 0 ? buildSankeyData(income, categories) : null),
    [income, categories]
  );

  const totalSpending = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const savingsCategory = categories.find((cat) => cat.name.toLowerCase().includes("saving"));
  const netSavings = savingsCategory ? savingsCategory.amount : Math.max(0, income - totalSpending);
  const savingsRate =
    income > 0 ? ((netSavings / income) * 100).toFixed(1) : "0";

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
          <p className="text-text-secondary">Loading budget data...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Monthly Income",
      value: `$${income.toLocaleString()}`,
      icon: Wallet,
      trend: "+3.2%",
      trendUp: true,
      color: "text-accent-green",
      bgColor: "bg-accent-green/10",
    },
    {
      label: "Total Spending",
      value: `$${totalSpending.toLocaleString()}`,
      icon: TrendingDown,
      trend: "-5.1%",
      trendUp: false,
      color: "text-accent-red",
      bgColor: "bg-accent-red/10",
    },
    {
      label: "Net Savings",
      value: `$${netSavings.toLocaleString()}`,
      icon: PiggyBank,
      trend: `${savingsRate}%`,
      trendUp: netSavings > 0,
      color: "text-accent-teal",
      bgColor: "bg-accent-teal/10",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Budget Flow</h1>
          <p className="text-text-secondary mt-1">
            Your spending visualized as a workflow — powered by AI analysis
          </p>
        </div>
        {isUsingMockData && (
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-card border border-border-main rounded-full px-3 py-1.5">
            <Database className="w-3 h-3" />
            Demo Data
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isIncome = stat.label === "Monthly Income";
          return (
            <div
              key={stat.label}
              className="bg-bg-card border border-border-main rounded-xl p-5 hover:bg-bg-card-hover transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? "text-accent-green" : "text-accent-red"
                    }`}
                >
                  {stat.trendUp ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.trend}
                </div>
              </div>
              {isIncome ? (
                <div className="text-2xl font-bold text-text-primary">
                  <EditableIncome income={income} onChangeIncome={updateIncome} />
                </div>
              ) : (
                <p className="text-2xl font-bold text-text-primary">
                  {stat.value}
                </p>
              )}
              <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Sankey Diagram */}
      {sankeyData && (
        <div className="bg-bg-card border border-border-main rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Money Flow Diagram
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                How your income flows through spending categories
              </p>
            </div>
            <div className="flex gap-2">
              {categories.slice(0, 5).map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs text-text-secondary">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <SankeyDiagram data={sankeyData} />
        </div>
      )}

      {/* Quick Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Spending Category */}
        <div className="bg-bg-card border border-border-main rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-accent-yellow/10 p-2 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-accent-yellow" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Top Spending</span>
          </div>
          {categories.length > 0 && (
            <>
              <p className="text-xl font-bold text-text-primary">
                {categories.reduce((max, cat) => cat.amount > max.amount ? cat : max, categories[0]).name}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                ${categories.reduce((max, cat) => cat.amount > max.amount ? cat : max, categories[0]).amount.toLocaleString()} this month
              </p>
            </>
          )}
        </div>

        {/* Daily Budget */}
        <div className="bg-bg-card border border-border-main rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-accent-green/10 p-2 rounded-lg">
              <Target className="w-4 h-4 text-accent-green" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Daily Budget</span>
          </div>
          <p className="text-xl font-bold text-accent-green">
            ${((income - totalSpending) / 30).toFixed(2)}
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Available per day to stay on track
          </p>
        </div>

        {/* Planner CTA */}
        <Link
          href="/planner"
          className="bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 rounded-xl p-5 hover:from-accent-purple/30 hover:to-accent-blue/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-accent-purple/20 p-2 rounded-lg">
              <CalendarDays className="w-4 h-4 text-accent-purple" />
            </div>
            <span className="text-sm font-medium text-accent-purple">Plan Ahead</span>
          </div>
          <p className="text-lg font-bold text-text-primary">Budget Planner</p>
          <p className="text-sm text-text-secondary mt-1">
            View spending heatmap & plan future expenses
          </p>
        </Link>
      </div>

      {/* Category Breakdown */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">Edit Categories</h2>
          <button
            onClick={() => setShowAddCategory(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card border border-border-main hover:bg-bg-card-hover transition-colors text-sm font-semibold text-text-primary"
          >
            <Plus className="w-4 h-4 text-accent-green" />
            Add category
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.name}
              category={cat}
              onUpdateSubcategory={(subName, amount) => updateSubcategory(cat.name, subName, amount)}
              onUpdateCategoryColor={updateCategoryColor}
              onDeleteCategory={(categoryName) => {
                const ok = window.confirm(`Delete category "${categoryName}"?`);
                if (!ok) return;
                removeCategory(categoryName);
              }}
            />
          ))}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-card rounded-xl p-6 w-full max-w-md border border-border-main">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Add Category</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Create a new spending category (starts with one editable "General" subcategory).
                </p>
              </div>
              <button
                onClick={() => setShowAddCategory(false)}
                className="p-2 rounded-lg hover:bg-bg-card-hover transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4 mt-5">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Name</label>
                <input
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    setAddCategoryError(null);
                  }}
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-main rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-green"
                  placeholder="e.g., Education"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Monthly Amount</label>
                  <input
                    value={newCategoryAmount}
                    onChange={(e) => {
                      setNewCategoryAmount(e.target.value);
                      setAddCategoryError(null);
                    }}
                    inputMode="decimal"
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-main rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-green"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1">Color</label>
                  <input
                    type="color"
                    value={newCategoryColor || "#6366f1"}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-full h-[42px] bg-bg-secondary border border-border-main rounded-lg p-1"
                    aria-label="Category color"
                  />
                </div>
              </div>

              {addCategoryError && (
                <p className="text-sm text-accent-red">{addCategoryError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddCategory(false)}
                className="flex-1 px-4 py-2 border border-border-main rounded-lg text-text-secondary hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const name = newCategoryName.trim();
                  if (!name) {
                    setAddCategoryError("Please enter a category name.");
                    return;
                  }
                  const exists = categories.some(
                    (c) => c.name.trim().toLowerCase() === name.toLowerCase()
                  );
                  if (exists) {
                    setAddCategoryError("A category with that name already exists.");
                    return;
                  }
                  const amt = parseCurrencyLikeInput(newCategoryAmount);
                  if (!Number.isFinite(amt) || amt < 0) {
                    setAddCategoryError("Please enter a valid non-negative amount.");
                    return;
                  }

                  const rounded = Math.round(amt);
                  addCategory({
                    name,
                    amount: rounded,
                    color: newCategoryColor || pickNextCategoryColor(categories.map((c) => c.color)),
                    subcategories: [{ name: "General", amount: rounded }],
                  });
                  setShowAddCategory(false);
                }}
                className="flex-1 px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-accent-green/90 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
