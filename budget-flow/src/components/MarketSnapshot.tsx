"use client";

import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface IndexData {
    name: string;
    value: string;
    change: string;
    percentChange: string;
    isPositive: boolean;
}

// Mock data - in a real app this would come from an API
const MARKET_DATA: IndexData[] = [
    {
        name: "S&P 500",
        value: "5,234.18",
        change: "+42.50",
        percentChange: "+0.82%",
        isPositive: true
    },
    {
        name: "NASDAQ",
        value: "16,421.34",
        change: "+182.12",
        percentChange: "+1.12%",
        isPositive: true
    },
    {
        name: "DOW",
        value: "39,512.84",
        change: "-84.30",
        percentChange: "-0.21%",
        isPositive: false
    }
];

export default function MarketSnapshot() {
    return (
        <div className="bg-bg-card border border-border-main rounded-xl p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-accent-green/10 p-2 rounded-lg">
                    <Activity className="w-5 h-5 text-accent-green" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-text-primary">Market Snapshot</h2>
                    <p className="text-xs text-text-secondary">Live Indices</p>
                </div>
            </div>

            <div className="space-y-4">
                {MARKET_DATA.map((index) => (
                    <div
                        key={index.name}
                        className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg border border-border-main"
                    >
                        <div className="flex flex-col">
                            <span className="font-bold text-text-primary">{index.name}</span>
                            <span className="text-sm text-text-secondary">{index.value}</span>
                        </div>

                        <div className={`flex items-center gap-2 px-2 py-1 rounded ${index.isPositive
                                ? "bg-accent-green/10 text-accent-green"
                                : "bg-accent-red/10 text-accent-red"
                            }`}>
                            {index.isPositive ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            <div className="text-right">
                                <p className="text-xs font-bold">{index.percentChange}</p>
                                <p className="text-[10px] opacity-80">{index.change}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border-main">
                <p className="text-xs text-text-secondary text-center">
                    Market data delayed by 15 mins
                </p>
            </div>
        </div>
    );
}
