"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useBudgetData } from "@/lib/use-budget-data";

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

    // Calculate monthly surplus
    const monthlySurplus = useMemo(() => {
        const totalExpenses = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
        return income - totalExpenses;
    }, [income, categories]);

    const hasSurplus = monthlySurplus > 0;
    const emergencyFundTarget = useMemo(() => {
        const monthlyExpenses = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
        return monthlyExpenses * 6; // 6 months of expenses
    }, [categories]);

    const strategy = STRATEGIES[riskLevel];

    return (
        <div className="p-6 space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <DollarSign className="text-accent-green" />
                    Where to Put Your Money
                </h1>
                <p className="text-text-secondary">
                    Smart recommendations for your extra cash
                </p>
            </div>

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

                    {/* AI Recommendation */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-border-main rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-purple/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                        
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">AI Recommendation</h2>
                                <p className="text-text-secondary text-sm">Based on your {riskLevel} risk profile</p>
                            </div>
                        </div>

                        <div className="bg-bg-secondary/50 rounded-lg p-4 mb-4 relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-text-secondary text-sm">Suggested Allocation</span>
                                <span className="text-accent-purple font-mono text-sm">{strategy.allocation}</span>
                            </div>
                            <p className="text-text-primary">
                                With <span className="text-accent-green font-bold">${monthlySurplus.toLocaleString()}/month</span>, 
                                {riskLevel === "conservative" && " prioritize building your emergency fund and safe, liquid savings."}
                                {riskLevel === "moderate" && " balance between growth investments and safe savings."}
                                {riskLevel === "aggressive" && " focus on growth while maintaining a basic emergency fund."}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-text-secondary relative z-10">
                            <Wallet className="w-4 h-4" />
                            <span>Emergency Fund Target: <span className="text-text-primary font-medium">${emergencyFundTarget.toLocaleString()}</span> (6 months expenses)</span>
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

                    {/* Quick Tips */}
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
                </>
            )}
        </div>
    );
}
