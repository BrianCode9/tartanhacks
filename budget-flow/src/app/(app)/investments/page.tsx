"use client";

import { useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    TrendingUp,
    Wallet,
    DollarSign,
    Brain,
    Sparkles,
    Target,
    ArrowRight,
    Zap,
    Shield,
    Rocket,
    Layers,
} from "lucide-react";
import { InvestmentsProvider, useInvestments, Timeframe } from "@/lib/investments-context";

const COLORS = {
    green: "#10b981",
    blue: "#6366f1",
    purple: "#8b5cf6",
    pink: "#ec4899",
    yellow: "#f59e0b",
    red: "#ef4444",
    teal: "#14b8a6",
};



type StrategyType = "conservative" | "moderate" | "aggressive";

const STRATEGIES = {
    conservative: {
        title: "High Yield Savings & Bonds",
        ticker: "HYSA / BND",
        description: "Maximize security while earning steady interest. Ideal for preserving capital and short-term goals.",
        growth: "3-4%",
        projection: "+$175.00",
        risk: "Low",
        riskColor: "text-accent-green",
        icon: Shield,
        color: "text-accent-green",
        bg: "bg-accent-green/10",
        border: "border-accent-green/20",
        allocation: [
            { name: "Bonds", value: 60 },
            { name: "Cash", value: 30 },
            { name: "Stocks", value: 10 },
        ]
    },
    moderate: {
        title: "S&P 500 ETF (VOO)",
        ticker: "VOO",
        description: "Balanced exposure to the top 500 US companies. The standard for long-term wealth building.",
        growth: "8-10%",
        projection: "+$420.00",
        risk: "Medium",
        riskColor: "text-accent-yellow",
        icon: Layers,
        color: "text-accent-blue",
        bg: "bg-accent-blue/10",
        border: "border-accent-blue/20",
        allocation: [
            { name: "Stocks", value: 60 },
            { name: "Bonds", value: 30 },
            { name: "Cash", value: 10 },
        ]
    },
    aggressive: {
        title: "Growth Tech & Innovation",
        ticker: "QQQ / BTC",
        description: "High-conviction bets on future technology and crypto. High volatility, highest potential upside.",
        growth: "12-15%+",
        projection: "+$750.00",
        risk: "High",
        riskColor: "text-accent-red",
        icon: Rocket,
        color: "text-accent-purple",
        bg: "bg-accent-purple/10",
        border: "border-accent-purple/20",
        allocation: [
            { name: "Stock", value: 50 },
            { name: "Crypto", value: 30 },
            { name: "Tech", value: 20 },
        ]
    }
};

function InvestmentsContent() {
    const {
        timeframe,
        setTimeframe,
        portfolioHistory,
        totalValue,
        daysGain,
        daysGainPercent,
        totalGain,
        totalGainPercent,
        buyingPower,
    } = useInvestments();

    const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>("moderate");
    const activeStrategy = STRATEGIES[selectedStrategy];

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <TrendingUp className="text-accent-purple" />
                        Wealth & Growth
                    </h1>
                    <p className="text-text-secondary">
                        Track your net worth and get personalized insights
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="bg-bg-card border border-border-main px-4 py-2 rounded-lg flex flex-col items-end">
                        <span className="text-xs text-text-secondary uppercase">Available Cash</span>
                        <span className="font-mono font-bold text-accent-green">${buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* AI Advisor Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-5 rounded-xl flex items-start gap-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                        <TrendingUp className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary mb-1">Portfolio On Track</h3>
                        <p className="text-sm text-text-secondary">
                            Your portfolio has grown by <span className="text-accent-green font-medium">1.2%</span> today. You are on track to hit your $50k milestone by December at this rate.
                        </p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 rounded-xl flex items-start gap-4">
                    <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                        <Wallet className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary mb-1">High Cash Balance</h3>
                        <p className="text-sm text-text-secondary">
                            You have <span className="text-text-primary font-medium">$15k</span> in uninvested cash. Consider moving this into a high-yield savings account or an ETF to beat inflation.
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Value */}
                <div className="bg-bg-card border border-border-main p-5 rounded-xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-12 h-12 text-accent-green" />
                    </div>
                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">
                        Total Net Worth
                    </p>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-text-primary">
                            ${totalValue.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Day's Gain */}
                <div className="bg-bg-card border border-border-main p-5 rounded-xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-12 h-12 text-accent-blue" />
                    </div>
                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">
                        Day&apos;s Growth
                    </p>
                    <div className="flex items-end gap-3">
                        <span className={`text-3xl font-bold ${daysGain >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                            {daysGain >= 0 ? "+" : ""}${daysGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <span className={`text-sm font-medium mb-1 ${daysGainPercent >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                            ({daysGainPercent >= 0 ? "+" : ""}{daysGainPercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>

                {/* Total Gain */}
                <div className="bg-bg-card border border-border-main p-5 rounded-xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-12 h-12 text-accent-purple" />
                    </div>
                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">
                        All Time Return
                    </p>
                    <div className="flex items-end gap-3">
                        <span className={`text-3xl font-bold ${totalGain >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                            {totalGain >= 0 ? "+" : ""}${totalGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <span className={`text-sm font-medium mb-1 ${totalGainPercent >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                            ({totalGainPercent >= 0 ? "+" : ""}{totalGainPercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Portfolio History Chart */}
                <div className="lg:col-span-3 bg-bg-card border border-border-main rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-accent-blue" />
                            Growth History
                        </h2>
                        <div className="flex bg-bg-secondary rounded-lg p-1 gap-1">
                            {(["1D", "1W", "1M", "3M", "1Y", "ALL"] as Timeframe[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTimeframe(t)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeframe === t
                                        ? "bg-accent-blue text-white shadow-sm"
                                        : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={portfolioHistory}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#2a2d3a"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        if (timeframe === "1D") {
                                            return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                                        }
                                        if (timeframe === "1W") {
                                            return date.toLocaleDateString("en-US", { weekday: "short" });
                                        }
                                        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                    }}
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1a1c25",
                                        borderColor: "#2a2d3a",
                                        color: "#f0f0f5",
                                        borderRadius: "0.5rem",
                                    }}
                                    itemStyle={{ color: "#f0f0f5" }}
                                    formatter={(value: number | string | Array<number | string> | undefined) => [`$${Number(value || 0).toLocaleString()}`, "Value"]}
                                    labelFormatter={(label) => {
                                        const date = new Date(label);
                                        if (timeframe === "1D" || timeframe === "1W") {
                                            return date.toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit"
                                            });
                                        }
                                        return date.toLocaleDateString("en-US", { month: "long", year: 'numeric' });
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={COLORS.blue}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>


            </div>

            {/* AI Financial Architect Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-border-main rounded-xl shadow-2xl overflow-hidden relative">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                <div className="p-8 relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg shadow-lg shadow-accent-purple/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">AI Financial Architect</h2>
                            <p className="text-text-secondary text-sm">Real-time wealth optimization engine</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Analysis Inputs */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                Analyzing Factors
                            </h3>

                            <div className="space-y-4">
                                <div className="bg-bg-secondary/50 border border-border-main rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                                        <span className="text-text-primary font-medium">Available Cash</span>
                                    </div>
                                    <span className="font-mono text-accent-green">${buyingPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>

                                <div className="bg-bg-secondary/50 border border-border-main rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
                                        <span className="text-text-primary font-medium">Monthly Income</span>
                                    </div>
                                    <span className="font-mono text-text-primary">$8,500</span>
                                </div>

                                {/* Strategy Selector */}
                                <div className="bg-bg-secondary/30 border border-border-main rounded-lg p-1 flex gap-1">
                                    {(["conservative", "moderate", "aggressive"] as StrategyType[]).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedStrategy(type)}
                                            className={`flex-1 py-2 rounded-md text-xs font-medium transition-all flex flex-col items-center gap-1 ${selectedStrategy === type
                                                ? "bg-bg-card text-white shadow-sm border border-border-main"
                                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                                                }`}
                                        >
                                            {type === "conservative" && <Shield className="w-4 h-4" />}
                                            {type === "moderate" && <Layers className="w-4 h-4" />}
                                            {type === "aggressive" && <Rocket className="w-4 h-4" />}
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Middle/Right Column: The Recommendation */}
                        <div className="lg:col-span-2 bg-bg-card/50 border border-border-main rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-accent-purple/50 transition-colors duration-500">
                            <div className="absolute top-0 right-0 p-3 opacity-30">
                                <Target className="w-24 h-24 text-accent-purple -mr-8 -mt-8" />
                            </div>

                            <div className="mb-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-xs font-medium mb-4 border border-accent-green/20">
                                    <Zap className="w-3 h-3" />
                                    High Conviction Opportunity
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Deploy $5,000 into {activeStrategy.title}
                                </h3>
                                <p className="text-text-secondary leading-relaxed">
                                    {activeStrategy.description}
                                </p>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex gap-8 text-sm">
                                    <div>
                                        <span className="block text-text-secondary text-xs mb-1">Projected 1Y Gain</span>
                                        <span className={`font-bold text-lg ${activeStrategy.color}`}>{activeStrategy.projection}</span>
                                        <span className="text-text-secondary text-xs ml-1">({activeStrategy.growth})</span>
                                    </div>
                                    <div>
                                        <span className="block text-text-secondary text-xs mb-1">Risk Level</span>
                                        <span className={`font-bold text-lg ${activeStrategy.riskColor}`}>{activeStrategy.risk}</span>
                                    </div>
                                </div>

                                <button className="w-full md:w-auto bg-white text-black hover:bg-white/90 px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-transform active:scale-95">
                                    Execute {activeStrategy.ticker}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function InvestmentsPage() {
    return (
        <InvestmentsProvider>
            <InvestmentsContent />
        </InvestmentsProvider>
    );
}
