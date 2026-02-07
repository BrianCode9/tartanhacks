"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SankeyDiagram, { SankeyDiagramHandle } from "@/components/SankeyDiagram";
import CategoryCard from "@/components/CategoryCard";
import { BudgetSankeyData, SpendingCategory } from "@/lib/types";
import { useBudgetData } from "@/lib/use-budget-data";
import { buildSankeyData } from "@/lib/mock-data";
import { useUser } from "@/lib/user-context";
import {
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  CalendarDays,
  Plus,
  Check,
  X,
  Edit2,
  Sparkles,
  RefreshCw,
  Save,
  Download,
} from "lucide-react";

function parseCurrencyLikeInput(value: string): number {
  // Accept inputs like "5000", "$5,000", "5,000.25".
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function formatUSD(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = `$${abs.toLocaleString()}`;
  return amount < 0 ? `-${formatted}` : formatted;
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
  const { user } = useUser();
  const { categories, income, isLoading, updateIncome, addCategory, removeCategory, updateCategoryColor, updateSubcategory, setCategories } = useBudgetData();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryAmount, setNewCategoryAmount] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState<string>("");
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);
  const [sankeyData, setSankeyData] = useState<BudgetSankeyData | null>(null);
  const [isFetchingFlow, setIsFetchingFlow] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiInsights, setAiInsights] = useState<{ summary: string; rationale: { category: string; explanation: string }[] } | null>(null);
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [hasBudget, setHasBudget] = useState(false);
  const isInitialLoad = useRef(true);
  const sankeyRef = useRef<SankeyDiagramHandle>(null);

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

  // Fetch saved budget flow from database → reconstruct into editable categories
  // IMPORTANT: Wait for useBudgetData to finish (isLoading = false) before fetching,
  // otherwise useBudgetData's setState can overwrite reconstructed categories.
  useEffect(() => {
    if (!user?.id || isLoading) return;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    setIsFetchingFlow(true);
    fetch(`/api/budget-flow?userId=${user.id}&month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.nodes && data.links) {
          // Build a lookup of node IDs
          const nodeMap = new Map<string, any>();
          data.nodes.forEach((node: any) => nodeMap.set(node.id, node));

          // Find category nodes and reconstruct SpendingCategory[]
          const categoryNodes = data.nodes.filter((n: any) => n.type === "category");
          const reconstructed: SpendingCategory[] = categoryNodes.map((catNode: any) => {
            const subLinks = data.links.filter(
              (link: any) => link.source.id === catNode.id
            );
            const subcategories = subLinks
              .map((link: any) => {
                const targetNode = nodeMap.get(link.target.id);
                if (targetNode && targetNode.type === "subcategory") {
                  return { name: targetNode.name, amount: parseFloat(link.amount) };
                }
                return null;
              })
              .filter(Boolean) as { name: string; amount: number }[];

            return {
              name: catNode.name,
              amount: parseFloat(catNode.amount),
              color: catNode.color || "#6366f1",
              subcategories,
            };
          });

          // Restore income from saved Income node
          const incomeNode = data.nodes.find((n: any) => n.type === "source" && n.name === "Income");
          if (incomeNode) {
            updateIncome(parseFloat(incomeNode.amount));
          }

          isInitialLoad.current = true;
          setCategories(reconstructed);
          setHasBudget(true);
          setHasUnsavedChanges(false);
        } else {
          setSankeyData(null);
          setHasBudget(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch budget flow:', err);
        setSankeyData(null);
        setHasBudget(false);
      })
      .finally(() => {
        setIsFetchingFlow(false);
      });
  }, [user?.id, isLoading]);

  // Live Sankey rebuild — only when a budget exists (from AI or saved flow)
  useEffect(() => {
    if (isFetchingFlow || !hasBudget) return;
    if (categories.length === 0) {
      setSankeyData(null);
      return;
    }
    const data = buildSankeyData(income, categories);
    setSankeyData(data);

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    } else {
      setHasUnsavedChanges(true);
    }
  }, [categories, income, isFetchingFlow, hasBudget]);

  // Build nodes & links payload for the budget-flow API from given categories/income
  const buildBudgetFlowPayload = (cats: SpendingCategory[], inc: number) => {
    const nodes: any[] = [];
    const links: any[] = [];
    const totalSpending = cats.reduce((sum, cat) => sum + cat.amount, 0);

    nodes.push({ id: "source-Income", name: "Income", type: "source", amount: inc, color: "#22c55e", order: 0 });
    nodes.push({ id: "hub-Expenses", name: "Expenses", type: "hub", amount: Math.min(inc, totalSpending), color: "#94a3b8", order: 1 });
    links.push({ source: "source-Income", target: "hub-Expenses", amount: Math.min(inc, totalSpending) });

    if (inc > totalSpending) {
      nodes.push({ id: "target-Unallocated", name: "Unallocated", type: "target", amount: inc - totalSpending, color: "#06b6d4", order: 2 });
      links.push({ source: "source-Income", target: "target-Unallocated", amount: inc - totalSpending });
    } else if (totalSpending > inc) {
      nodes.push({ id: "source-Shortfall", name: "Debt / Shortfall", type: "source", amount: totalSpending - inc, color: "#ef4444", order: 2 });
      links.push({ source: "source-Shortfall", target: "hub-Expenses", amount: totalSpending - inc });
    }

    let orderCounter = 3;
    cats.forEach((cat) => {
      const catId = `cat-${cat.name}`;
      nodes.push({ id: catId, name: cat.name, type: "category", amount: cat.amount, color: cat.color, order: orderCounter++ });
      links.push({ source: "hub-Expenses", target: catId, amount: cat.amount });

      cat.subcategories.forEach((sub) => {
        const subId = `sub-${cat.name}-${sub.name}`;
        nodes.push({ id: subId, name: sub.name, type: "subcategory", amount: sub.amount, color: cat.color, order: orderCounter++ });
        links.push({ source: catId, target: subId, amount: sub.amount });
      });
    });

    return { nodes, links };
  };

  // Save budget flow to database
  const saveBudgetFlow = async (cats: SpendingCategory[], inc: number) => {
    if (!user?.id) return;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const { nodes, links } = buildBudgetFlowPayload(cats, inc);

    const res = await fetch("/api/budget-flow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, month, year, nodes, links }),
    });
    if (!res.ok) throw new Error("Failed to save budget flow");
  };

  // Generate budget with AI
  const handleGenerateWithAI = async () => {
    if (!user?.id) return;
    setIsGeneratingAI(true);
    setAiError(null);

    try {
      // 1. Fetch transactions
      const txRes = await fetch(`/api/transactions?userId=${user.id}`);
      if (!txRes.ok) throw new Error("Failed to fetch transactions");
      const transactions = await txRes.json();

      // 2. Filter to current month
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentMonthTx = transactions.filter((tx: any) => {
        const date = new Date(tx.transactionDate);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      });

      if (currentMonthTx.length === 0) {
        setAiError("No transactions found for the current month. Add some transactions first.");
        setIsGeneratingAI(false);
        return;
      }

      // 3. Build aggregated category summary (faster than listing every transaction)
      const categoryTotals = new Map<string, number>();
      currentMonthTx.forEach((tx: any) => {
        const category = tx.merchant?.category || "Uncategorized";
        categoryTotals.set(category, (categoryTotals.get(category) || 0) + Math.abs(tx.amount));
      });

      const summary = Array.from(categoryTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([cat, total]) => `${cat}: $${total.toFixed(0)}`)
        .join(", ");

      const prompt = `Income: $${income.toLocaleString()}/mo. Spending this month by category: ${summary}. Propose a budget.`;

      // 4. Call AI
      const aiRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "budget-flow-proposal", prompt }),
      });

      if (!aiRes.ok) throw new Error("AI request failed");
      const aiData = await aiRes.json();

      // 5. Parse response (handle markdown fence wrapping)
      let responseText = aiData.response;
      if (responseText.startsWith("```")) {
        responseText = responseText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }
      const parsed = JSON.parse(responseText);

      // 6. Set categories
      const aiCategories: SpendingCategory[] = parsed.categories.map((cat: any) => ({
        name: cat.name,
        amount: Math.round(cat.amount),
        color: cat.color || "#6366f1",
        subcategories: (cat.subcategories || []).map((sub: any) => ({
          name: sub.name,
          amount: Math.round(sub.amount),
        })),
      }));

      if (parsed.proposedIncome) {
        updateIncome(Math.round(parsed.proposedIncome));
      }

      // Store AI insights
      if (parsed.rationale || parsed.summary) {
        setAiInsights({
          summary: parsed.summary || "",
          rationale: parsed.rationale || [],
        });
      }

      // Populate categories with AI proposal — live rebuild effect will build Sankey
      const effectiveIncome = parsed.proposedIncome ? Math.round(parsed.proposedIncome) : income;
      isInitialLoad.current = false;
      setCategories(aiCategories);
      setHasBudget(true);

      // Auto-save to database so the budget persists across page loads
      try {
        await saveBudgetFlow(aiCategories, effectiveIncome);
        setHasUnsavedChanges(false);
      } catch (saveErr) {
        console.error("Auto-save failed:", saveErr);
        setHasUnsavedChanges(true);
      }
    } catch (err) {
      console.error("AI generation failed:", err);
      setAiError(err instanceof Error ? err.message : "Failed to generate budget");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);

    try {
      await saveBudgetFlow(categories, income);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Export Sankey diagram as PNG
  const handleExportPNG = () => {
    const svgEl = sankeyRef.current?.getSvgElement();
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgClone = svgEl.cloneNode(true) as SVGSVGElement;

    // Set background color on the clone
    svgClone.setAttribute("style", "background: #0f1117");

    const svgString = serializer.serializeToString(svgClone);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2; // 2x resolution for crisp export
      canvas.width = svgEl.width.baseVal.value * scale;
      canvas.height = svgEl.height.baseVal.value * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `budget-flow-${new Date().toISOString().slice(0, 7)}.png`;
      link.href = pngUrl;
      link.click();
    };
    img.src = url;
  };

  const totalSpending = categories.reduce((sum, cat) => sum + cat.amount, 0);
  // Net savings = what's left after allocations. Can be negative (shortfall).
  const netSavings = income - totalSpending;
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
      value: formatUSD(netSavings),
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
        {aiInsights && (
          <button
            onClick={() => setShowAISidebar(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            AI Budget Insights
          </button>
        )}
      </div>

      {/* AI Insights Sidebar */}
      {showAISidebar && aiInsights && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAISidebar(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-primary border-l border-border-main z-50 overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-bg-primary border-b border-border-main p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-accent-purple to-accent-pink p-2 rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-semibold text-text-primary">AI Budget Insights</h2>
              </div>
              <button
                onClick={() => setShowAISidebar(false)}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-text-secondary mb-4">Powered by Dedalus AI</p>

              {aiInsights.summary && (
                <div className="bg-bg-secondary rounded-lg p-4 border border-border-main mb-4">
                  <p className="text-text-primary">{aiInsights.summary}</p>
                </div>
              )}

              <div className="grid gap-3">
                {aiInsights.rationale.map((item) => {
                  const matchedCat = categories.find(
                    (c) => c.name.toLowerCase() === item.category.toLowerCase()
                  );
                  return (
                    <div
                      key={item.category}
                      className="rounded-lg p-4 border border-accent-purple/20 bg-accent-purple/5"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 mt-1"
                          style={{ backgroundColor: matchedCat?.color || "#6366f1" }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-text-primary">{item.category}</h3>
                            {matchedCat && (
                              <span className="text-sm font-semibold text-accent-green">
                                ${matchedCat.amount.toLocaleString()}/mo
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary mt-1">{item.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Stats Cards — only show when a budget exists */}
      {hasBudget && (
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
      )}

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
            <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPNG}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-main hover:bg-bg-card-hover transition-colors text-sm text-text-secondary"
                  title="Export as PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-main hover:bg-bg-card-hover transition-colors text-sm text-text-secondary disabled:opacity-50"
                >
                  {isGeneratingAI ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  Regenerate
                </button>
                {hasUnsavedChanges ? (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-green text-white text-sm font-semibold hover:bg-accent-green/90 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save Budget
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-accent-green">
                    <Check className="w-3.5 h-3.5" />
                    Saved
                  </span>
                )}
              </div>
            </div>
          </div>
          <SankeyDiagram ref={sankeyRef} data={sankeyData} />
        </div>
      )}


      {/* Blank State — Generate with AI */}
      {!sankeyData && !isFetchingFlow && (
        <div className="bg-bg-card border border-border-main rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-accent-purple" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No Budget Flow Yet
            </h3>
            <p className="text-text-secondary mb-6">
              Let AI analyze your transactions and propose a personalized monthly budget with categories, subcategories, and a flow diagram.
            </p>
            {aiError && (
              <p className="text-sm text-accent-red mb-4">{aiError}</p>
            )}
            <button
              onClick={handleGenerateWithAI}
              disabled={isGeneratingAI}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing your spending...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate with AI
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 hover:from-accent-purple/30 hover:to-accent-blue/30 transition-all text-text-primary"
        >
          <CalendarDays className="w-4 h-4 text-accent-purple" />
          <span className="text-sm font-semibold">Open Budget Planner</span>
        </Link>
      </div>

      {/* Budget Category Breakdown — only show when a budget exists */}
      {hasBudget && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Edit Budget Categories</h2>
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
      )}

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
