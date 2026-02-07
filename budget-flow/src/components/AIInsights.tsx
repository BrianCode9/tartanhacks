"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCcw, AlertTriangle, Loader2, Lightbulb, TrendingDown } from "lucide-react";

interface Tip {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    potentialSavings?: number;
}

interface AIInsightsData {
    summary: string;
    tips: Tip[];
    encouragement: string;
}

interface AIInsightsProps {
    transactions: {
        merchant: string;
        amount: number;
        category: string;
        date: string;
    }[];
    recurringExpenses: {
        merchant: string;
        amount: number;
        category: string;
    }[];
    totalSpending: number;
    income: number;
}

// Simple cache to avoid re-fetching on sidebar toggle
const insightsCache: { data: AIInsightsData | null; timestamp: number; loading: boolean } = { data: null, timestamp: 0, loading: false };
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Preload function that can be called from parent component
export async function preloadAIInsights(transactions: AIInsightsProps["transactions"], recurringExpenses: AIInsightsProps["recurringExpenses"], totalSpending: number, income: number) {
    // Skip if already cached or loading
    if (insightsCache.loading || (insightsCache.data && Date.now() - insightsCache.timestamp < CACHE_DURATION)) {
        return;
    }

    insightsCache.loading = true;

    try {
        const spendingByCategory: Record<string, number> = {};
        transactions.forEach((tx) => {
            spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount;
        });

        const topCategories = Object.entries(spendingByCategory)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const recurringTotal = recurringExpenses.reduce((sum, e) => sum + e.amount, 0);

        const prompt = `Income: $${income}, Spending: $${totalSpending}, Net: $${income - totalSpending}
Top categories: ${topCategories.map(([cat, amt]) => `${cat}:$${amt}`).join(", ")}
Recurring ($${recurringTotal}/mo): ${recurringExpenses.slice(0, 5).map((e) => `${e.merchant}:$${e.amount}`).join(", ")}
Give 2-3 specific tips to cut costs and save money.`;

        const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, type: "budget-tips" }),
        });

        if (res.ok) {
            const data = await res.json();
            let content = data.response;
            if (content.includes("```json")) {
                content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
            } else if (content.includes("```")) {
                content = content.replace(/```\n?/g, "");
            }
            try {
                insightsCache.data = JSON.parse(content.trim());
            } catch {
                insightsCache.data = {
                    summary: "AI analysis complete",
                    tips: [{ title: "Analysis", description: data.response, priority: "medium" as const }],
                    encouragement: "Keep tracking your spending!",
                };
            }
            insightsCache.timestamp = Date.now();
        }
    } catch (e) {
        console.warn("Preload AI insights failed:", e);
    } finally {
        insightsCache.loading = false;
    }
}

export default function AIInsights({ transactions, recurringExpenses, totalSpending, income }: AIInsightsProps) {
    const [insights, setInsights] = useState<AIInsightsData | null>(insightsCache.data);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    const fetchInsights = async (force = false) => {
        // Check cache first
        if (!force && insightsCache.data && Date.now() - insightsCache.timestamp < CACHE_DURATION) {
            setInsights(insightsCache.data);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Build a compact summary (reduce tokens for faster response)
            const spendingByCategory: Record<string, number> = {};
            transactions.forEach((tx) => {
                spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount;
            });

            const topCategories = Object.entries(spendingByCategory)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            const recurringTotal = recurringExpenses.reduce((sum, e) => sum + e.amount, 0);

            // Shortened prompt for faster response
            const prompt = `Income: $${income}, Spending: $${totalSpending}, Net: $${income - totalSpending}
Top categories: ${topCategories.map(([cat, amt]) => `${cat}:$${amt}`).join(", ")}
Recurring ($${recurringTotal}/mo): ${recurringExpenses.slice(0, 5).map((e) => `${e.merchant}:$${e.amount}`).join(", ")}
Give 2-3 specific tips to cut costs and save money.`;

            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, type: "budget-tips" }),
            });

            if (!res.ok) {
                throw new Error(`API error: ${res.status}`);
            }

            const data = await res.json();

            let parsed: AIInsightsData;
            try {
                let content = data.response;
                if (content.includes("```json")) {
                    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
                } else if (content.includes("```")) {
                    content = content.replace(/```\n?/g, "");
                }
                parsed = JSON.parse(content.trim());
            } catch {
                parsed = {
                    summary: "AI analysis complete",
                    tips: [{ title: "Analysis", description: data.response, priority: "medium" }],
                    encouragement: "Keep tracking your spending!",
                };
            }

            // Cache the result
            insightsCache.data = parsed;
            insightsCache.timestamp = Date.now();
            setInsights(parsed);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get AI insights");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (transactions.length > 0 && !hasFetched.current) {
            hasFetched.current = true;
            fetchInsights();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "border-accent-red/30 bg-accent-red/5";
            case "medium":
                return "border-accent-yellow/30 bg-accent-yellow/5";
            default:
                return "border-accent-green/30 bg-accent-green/5";
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "high":
                return <AlertTriangle className="w-4 h-4 text-accent-red" />;
            case "medium":
                return <TrendingDown className="w-4 h-4 text-accent-yellow" />;
            default:
                return <Lightbulb className="w-4 h-4 text-accent-green" />;
        }
    };

    // Skeleton loading component with spinner
    const SkeletonLoader = () => (
        <div className="space-y-4">
            {/* Prominent spinning loader */}
            <div className="flex items-center justify-center py-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-accent-purple/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-accent-purple rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-text-secondary">Analyzing your spending...</p>
                </div>
            </div>
            {/* Skeleton cards */}
            <div className="space-y-3 animate-pulse">
                <div className="bg-bg-secondary rounded-lg p-4 border border-border-main">
                    <div className="h-4 bg-bg-card rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-bg-card rounded w-1/2"></div>
                </div>
                {[1, 2].map((i) => (
                    <div key={i} className="rounded-lg p-4 border border-border-main bg-bg-secondary/50">
                        <div className="flex items-start gap-3">
                            <div className="w-4 h-4 bg-bg-card rounded-full mt-1"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-bg-card rounded w-1/3 mb-2"></div>
                                <div className="h-3 bg-bg-card rounded w-full mb-1"></div>
                                <div className="h-3 bg-bg-card rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-text-secondary">Powered by Dedalus AI</p>
                <button
                    onClick={() => fetchInsights(true)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-bg-secondary hover:bg-bg-card border border-border-main rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {loading && <SkeletonLoader />}

            {error && (
                <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4">
                    <p className="text-accent-red text-sm">{error}</p>
                    <button
                        onClick={() => fetchInsights(true)}
                        className="mt-2 text-sm text-accent-red underline hover:no-underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {insights && !loading && (
                <div className="space-y-4">
                    <div className="bg-bg-secondary rounded-lg p-4 border border-border-main">
                        <p className="text-text-primary">{insights.summary}</p>
                    </div>

                    <div className="grid gap-3">
                        {insights.tips.map((tip, index) => (
                            <div
                                key={index}
                                className={`rounded-lg p-4 border ${getPriorityColor(tip.priority)}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getPriorityIcon(tip.priority)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-text-primary">{tip.title}</h3>
                                            {tip.potentialSavings && (
                                                <span className="text-sm font-semibold text-accent-green">
                                                    Save ${tip.potentialSavings}/mo
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-text-secondary mt-1">{tip.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {insights.encouragement && (
                        <div className="text-center py-3 text-sm text-text-secondary italic">
                            💡 {insights.encouragement}
                        </div>
                    )}
                </div>
            )}

            {!loading && !error && !insights && transactions.length === 0 && (
                <div className="text-center py-8 text-text-secondary">
                    <p>No transaction data available for analysis.</p>
                </div>
            )}
        </div>
    );
}
