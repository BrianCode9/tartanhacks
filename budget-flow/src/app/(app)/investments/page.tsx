"use client";

import { useState, useMemo, useEffect } from "react";
import {
    TrendingUp,
    Wallet,
    DollarSign,
    Sparkles,
    Target,
    ArrowRight,
    Shield,
    Rocket,
    Layers,
    PiggyBank,
    Building,
    Coins,
    AlertCircle,
    CheckCircle2,
    X,
} from "lucide-react";
import { useBudgetData } from "@/lib/use-budget-data";
import AISavingsAdvice, { preloadAISavingsAdvice } from "@/components/AISavingsAdvice";
import InvestingEducation from "@/components/InvestingEducation";
import MarketSnapshot from "@/components/MarketSnapshot";
import CompoundInterestCalculator from "@/components/CompoundInterestCalculator";
import InvestingQuiz from "@/components/InvestingQuiz";

type RiskLevel = "conservative" | "moderate" | "aggressive";

const INVESTMENT_OPTIONS = {
    emergency: {
        title: "Emergency Fund",
        icon: Shield,
        description: "Keep 3-6 months of expenses in a high-yield savings account before investing.",
        return: "4-5% APY",
        risk: "None",
        color: "text-accent-green",
        bg: "bg-accent-green/10",
        border: "border-accent-green/20",
        priority: 1,
    },
    hysa: {
        title: "High-Yield Savings",
        icon: PiggyBank,
        description: "Best for short-term goals (1-2 years). Safe, liquid, FDIC insured.",
        return: "4-5% APY",
        risk: "Very Low",
        color: "text-accent-green",
        bg: "bg-accent-green/10",
        border: "border-accent-green/20",
        priority: 2,
    },
    bonds: {
        title: "Treasury Bonds / I-Bonds",
        icon: Building,
        description: "Government-backed, beats inflation. Good for medium-term savings.",
        return: "4-6%",
        risk: "Low",
        color: "text-accent-teal",
        bg: "bg-accent-teal/10",
        border: "border-accent-teal/20",
        priority: 3,
    },
    indexFund: {
        title: "S&P 500 Index Fund (VOO/VTI)",
        icon: Layers,
        description: "Diversified exposure to top US companies. Best for long-term wealth building (5+ years).",
        return: "8-10% avg",
        risk: "Medium",
        color: "text-accent-blue",
        bg: "bg-accent-blue/10",
        border: "border-accent-blue/20",
        priority: 4,
    },
    growthStocks: {
        title: "Growth ETFs (QQQ)",
        icon: TrendingUp,
        description: "Tech-heavy, higher growth potential. More volatility, higher reward potential.",
        return: "10-15%+",
        risk: "Medium-High",
        color: "text-accent-purple",
        bg: "bg-accent-purple/10",
        border: "border-accent-purple/20",
        priority: 5,
    },
    crypto: {
        title: "Crypto / Bitcoin",
        icon: Coins,
        description: "High volatility, speculative. Only invest what you can afford to lose.",
        return: "Variable",
        risk: "Very High",
        color: "text-accent-yellow",
        bg: "bg-accent-yellow/10",
        border: "border-accent-yellow/20",
        priority: 6,
    },
};

const STRATEGIES: Record<RiskLevel, { options: (keyof typeof INVESTMENT_OPTIONS)[]; allocation: string }> = {
    conservative: {
        options: ["emergency", "hysa", "bonds"],
        allocation: "60% HYSA, 30% Bonds, 10% Index",
    },
    moderate: {
        options: ["emergency", "hysa", "indexFund", "bonds"],
        allocation: "50% Index, 30% Bonds, 20% HYSA",
    },
    aggressive: {
        options: ["emergency", "indexFund", "growthStocks", "crypto"],
        allocation: "60% Index, 25% Growth, 15% Crypto",
    },
};

export default function InvestmentsPage() {
    const { income, categories } = useBudgetData();
    const [riskLevel, setRiskLevel] = useState<RiskLevel>("moderate");
    const [showAISidebar, setShowAISidebar] = useState(false);
    const [aiPreloaded, setAiPreloaded] = useState(false);

    // Calculate monthly surplus
    const monthlySurplus = useMemo(() => {
        const totalExpenses = categories.reduce((sum, cat) => sum + cat.amount, 0);
        return income - totalExpenses;
    }, [income, categories]);

    const hasSurplus = monthlySurplus > 0;
    const emergencyFundTarget = useMemo(() => {
        const monthlyExpenses = categories.reduce((sum, cat) => sum + cat.amount, 0);
        return monthlyExpenses * 6; // 6 months of expenses
    }, [categories]);

    // Preload AI savings advice in background when page loads
    useEffect(() => {
        if (!aiPreloaded && hasSurplus) {
            setAiPreloaded(true);
            preloadAISavingsAdvice(monthlySurplus, riskLevel, emergencyFundTarget, income);
        }
    }, [hasSurplus, aiPreloaded, monthlySurplus, riskLevel, emergencyFundTarget, income]);

    const strategy = STRATEGIES[riskLevel];

    return (
        <div className="p-6 space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <DollarSign className="text-accent-green" />
                        Where to Put Your Money
                    </h1>
                    <p className="text-text-secondary">
                        Smart recommendations for your extra cash
                    </p>
                </div>
                {hasSurplus && (
                    <button
                        onClick={() => setShowAISidebar(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity shadow-lg"
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Investment Advisor
                    </button>
                )}
            </div>

            {/* AI Sidebar */}
            {showAISidebar && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowAISidebar(false)}
                    />
                    {/* Sidebar */}
                    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-primary border-l border-border-main z-50 overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-bg-primary border-b border-border-main p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-gradient-to-br from-accent-purple to-accent-pink p-2 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-text-primary">AI Investment Advisor</h2>
                                    <p className="text-xs text-text-secondary capitalize">{riskLevel} risk profile</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAISidebar(false)}
                                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-text-secondary" />
                            </button>
                        </div>
                        <div className="p-4">
                            <AISavingsAdvice
                                surplus={monthlySurplus}
                                riskLevel={riskLevel}
                                emergencyFundTarget={emergencyFundTarget}
                                income={income}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Surplus Status */}
            <div className={`rounded-xl p-6 border ${hasSurplus ? "bg-accent-green/10 border-accent-green/20" : "bg-accent-red/10 border-accent-red/20"}`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${hasSurplus ? "bg-accent-green/20" : "bg-accent-red/20"}`}>
                        {hasSurplus ? (
                            <CheckCircle2 className="w-6 h-6 text-accent-green" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-accent-red" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-text-primary mb-1">
                            {hasSurplus ? "Great News! You Have Surplus" : "No Surplus Available"}
                        </h2>
                        <p className="text-text-secondary mb-3">
                            {hasSurplus ? (
                                <>Based on your budget, you have <span className="text-accent-green font-bold">${monthlySurplus.toLocaleString()}/month</span> available to invest or save.</>
                            ) : (
                                <>Your expenses exceed your income. Focus on reducing spending before investing.</>
                            )}
                        </p>
                        {hasSurplus && (
                            <div className="flex gap-6 text-sm">
                                <div>
                                    <span className="text-text-secondary">Monthly:</span>
                                    <span className="font-bold text-text-primary ml-2">${monthlySurplus.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary">Yearly:</span>
                                    <span className="font-bold text-text-primary ml-2">${(monthlySurplus * 12).toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {hasSurplus && (
                <>
                    {/* Risk Preference Selector */}
                    <div className="bg-bg-card border border-border-main rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-accent-purple" />
                            Your Risk Preference
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                            {(["conservative", "moderate", "aggressive"] as RiskLevel[]).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setRiskLevel(level)}
                                    className={`p-4 rounded-lg border transition-all ${riskLevel === level
                                        ? "bg-accent-purple/10 border-accent-purple text-text-primary"
                                        : "bg-bg-secondary border-border-main text-text-secondary hover:bg-bg-card-hover"
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        {level === "conservative" && <Shield className="w-5 h-5" />}
                                        {level === "moderate" && <Layers className="w-5 h-5" />}
                                        {level === "aggressive" && <Rocket className="w-5 h-5" />}
                                        <span className="font-medium capitalize">{level}</span>
                                        <span className="text-xs opacity-70">
                                            {level === "conservative" && "Safety first"}
                                            {level === "moderate" && "Balanced growth"}
                                            {level === "aggressive" && "Max growth"}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Investment Options */}
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Recommended Options</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {strategy.options.map((optionKey) => {
                                const option = INVESTMENT_OPTIONS[optionKey];
                                const Icon = option.icon;
                                return (
                                    <div
                                        key={optionKey}
                                        className={`${option.bg} ${option.border} border rounded-xl p-5 hover:scale-[1.02] transition-transform`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-lg bg-white/10`}>
                                                <Icon className={`w-5 h-5 ${option.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-text-primary mb-1">{option.title}</h3>
                                                <p className="text-sm text-text-secondary mb-3">{option.description}</p>
                                                <div className="flex gap-4 text-xs">
                                                    <div>
                                                        <span className="text-text-secondary">Return:</span>
                                                        <span className={`ml-1 font-medium ${option.color}`}>{option.return}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-text-secondary">Risk:</span>
                                                        <span className="ml-1 font-medium text-text-primary">{option.risk}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Tools & Education - Always Visible */}
            <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Financial Tools & Knowledge</h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <CompoundInterestCalculator />
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <MarketSnapshot />
                            <InvestingQuiz />
                        </div>
                        <InvestingEducation />
                    </div>
                </div>
            </div>

            {/* Quick Tips - Always Visible */}
            <div className="bg-bg-card border border-border-main rounded-xl p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Tips</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                        <ArrowRight className="w-4 h-4 text-accent-green mt-0.5 shrink-0" />
                        <p className="text-text-secondary">
                            <span className="text-text-primary font-medium">Start with an emergency fund.</span> Aim for 3-6 months of expenses before investing.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <ArrowRight className="w-4 h-4 text-accent-blue mt-0.5 shrink-0" />
                        <p className="text-text-secondary">
                            <span className="text-text-primary font-medium">Automate your savings.</span> Set up automatic transfers on payday.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <ArrowRight className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" />
                        <p className="text-text-secondary">
                            <span className="text-text-primary font-medium">Time in market beats timing the market.</span> Consistent investing wins long-term.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
