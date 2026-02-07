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
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    TrendingUp,
    PieChart as PieChartIcon,
    Wallet,
    DollarSign,
    Plus,
} from "lucide-react";
import { InvestmentsProvider, useInvestments, Timeframe } from "@/lib/investments-context";
import TradeModal from "@/components/TradeModal";

const COLORS = {
    green: "#10b981",
    blue: "#6366f1",
    purple: "#8b5cf6",
    pink: "#ec4899",
    yellow: "#f59e0b",
    red: "#ef4444",
    teal: "#14b8a6",
};

const PIE_COLORS = [COLORS.blue, COLORS.purple, COLORS.yellow, COLORS.green, COLORS.teal];

function InvestmentsContent() {
    const {
        timeframe,
        setTimeframe,
        holdings,
        portfolioHistory,
        assetAllocation,
        totalValue,
        daysGain,
        daysGainPercent,
        totalGain,
        totalGainPercent,
        buyingPower,
        buy,
        sell,
    } = useInvestments();

    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

    const handleTrade = (symbol: string, quantity: number, price: number, type: "buy" | "sell") => {
        if (type === "buy") {
            // Simple logic to guess asset class for demo
            let assetClass: "Stock" | "Crypto" | "ETF" = "Stock";
            if (["BTC", "ETH", "SOL"].includes(symbol)) assetClass = "Crypto";
            if (["VOO", "VTI", "QQQ"].includes(symbol)) assetClass = "ETF";

            buy(symbol, symbol, quantity, price, assetClass);
        } else {
            // Find holding ID to sell
            const holding = holdings.find(h => h.symbol === symbol);
            if (holding) {
                sell(holding.id, quantity, price);
            } else {
                alert("You don't own this asset!");
            }
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <TrendingUp className="text-accent-purple" />
                        Investments
                    </h1>
                    <p className="text-text-secondary">
                        Manage your simulated portfolio
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="bg-bg-card border border-border-main px-4 py-2 rounded-lg flex flex-col items-end">
                        <span className="text-xs text-text-secondary uppercase">Buying Power</span>
                        <span className="font-mono font-bold text-accent-green">${buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <button
                        onClick={() => setIsTradeModalOpen(true)}
                        className="bg-accent-blue hover:bg-accent-blue/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-accent-blue/20"
                    >
                        <Plus className="w-4 h-4" />
                        Trade
                    </button>
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
                        Total Grid Value
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
                        Day&apos;s Gain
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
                        Total Return
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
                <div className="lg:col-span-2 bg-bg-card border border-border-main rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-accent-blue" />
                            Portfolio History
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
                                        return date.toLocaleDateString("en-US", { month: "short" });
                                    }}
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
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
                                        if (timeframe === "1D") {
                                            return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
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

                {/* Asset Allocation Chart */}
                <div className="bg-bg-card border border-border-main rounded-xl p-6 shadow-lg">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-6">
                        <PieChartIcon className="w-5 h-5 text-accent-purple" />
                        Asset Allocation
                    </h2>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={assetAllocation}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {assetAllocation.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1a1c25",
                                        borderColor: "#2a2d3a",
                                        color: "#f0f0f5",
                                        borderRadius: "0.5rem",
                                    }}
                                    itemStyle={{ color: "#f0f0f5" }}
                                    formatter={(value: number | string | Array<number | string> | undefined) => `$${Number(value || 0).toLocaleString()}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {assetAllocation.map((entry, index) => (
                                <div key={entry.id} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                    <span className="text-xs text-text-secondary">{entry.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-bg-card border border-border-main rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-border-main">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-accent-green" />
                        Holdings
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-bg-secondary text-text-secondary text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Asset</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium text-right">Price</th>
                                <th className="px-6 py-4 font-medium text-right">Shares</th>
                                <th className="px-6 py-4 font-medium text-right">Total Value</th>
                                <th className="px-6 py-4 font-medium text-right">Change</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-main">
                            {holdings.map((holding) => (
                                <tr
                                    key={holding.id}
                                    className="hover:bg-bg-secondary/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-text-primary font-medium">
                                                {holding.symbol}
                                            </span>
                                            <span className="text-text-secondary text-xs">
                                                {holding.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded bg-bg-secondary text-xs font-medium text-text-secondary border border-border-main">
                                            {holding.assetClass}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-primary text-right">
                                        ${holding.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-text-primary text-right">
                                        {holding.shares.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-text-primary font-medium text-right">
                                        ${holding.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span
                                            className={`inline-flex items-center gap-1 text-sm font-medium ${holding.change >= 0
                                                ? "text-accent-green"
                                                : "text-accent-red"
                                                }`}
                                        >
                                            {holding.change >= 0 ? "+" : ""}
                                            {holding.change}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {holdings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                                        No holdings yet. Click &quot;Trade&quot; to start simulated investing!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <TradeModal
                isOpen={isTradeModalOpen}
                onClose={() => setIsTradeModalOpen(false)}
                onTrade={handleTrade}
            />
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
