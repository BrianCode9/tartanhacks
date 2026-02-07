"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";
import {
    mockHoldings,
    Holding,
    PortfolioDataPoint,
    AssetAllocation,
} from "./mock-investments";

export type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

interface InvestmentsContextType {
    timeframe: Timeframe;
    setTimeframe: (t: Timeframe) => void;
    holdings: Holding[];
    portfolioHistory: PortfolioDataPoint[];
    assetAllocation: AssetAllocation[];
    totalValue: number;
    daysGain: number;
    daysGainPercent: number;
    totalGain: number;
    totalGainPercent: number;
    buyingPower: number;
    buy: (symbol: string, name: string, quantity: number, price: number, assetClass: "Stock" | "Bond" | "ETF" | "Crypto") => void;
    sell: (id: string, quantity: number, price: number) => void;
}

const InvestmentsContext = createContext<InvestmentsContextType | undefined>(undefined);

export function useInvestments() {
    const context = useContext(InvestmentsContext);
    if (!context) {
        throw new Error("useInvestments must be used within an InvestmentsProvider");
    }
    return context;
}

// Helper to generate mock history
function generateMockHistory(days: number, endValue: number): PortfolioDataPoint[] {
    const data: PortfolioDataPoint[] = [];
    let currentValue = endValue;
    const now = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        data.push({
            date: date.toISOString().split('T')[0],
            value: currentValue
        });

        // Random daily change between -1.5% and +1.5%
        const change = 1 + (Math.random() * 0.03 - 0.012);
        currentValue = currentValue / change;
    }
    return data.reverse();
}

// Helper to generate mock intraday history (every 30 mins)
function generateIntradayHistory(endValue: number): PortfolioDataPoint[] {
    const data: PortfolioDataPoint[] = [];
    const today = new Date();
    today.setHours(9, 30, 0, 0); // Market open 9:30 AM

    // Start slightly off from endValue to show movement, converging to endValue
    let currentValue = endValue * (1 - (Math.random() * 0.02 - 0.01));

    for (let i = 0; i <= 13; i++) { // 9:30 to 4:00 is 6.5 hours = 13 intervals
        data.push({
            date: today.toISOString(),
            value: currentValue
        });

        // Random walk
        const change = 1 + (Math.random() * 0.01 - 0.004);
        currentValue = currentValue * change;

        today.setMinutes(today.getMinutes() + 30);
    }

    // Ensure the last point matches the current "total value" roughly or just let it float
    return data;
}

export function InvestmentsProvider({ children }: { children: ReactNode }) {
    const [holdings, setHoldings] = useState<Holding[]>(mockHoldings);
    const [buyingPower, setBuyingPower] = useState(15000); // Start with $15k cash to trade
    const [timeframe, setTimeframe] = useState<Timeframe>("1Y");

    // Derived state
    const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0) + buyingPower;

    // Generate full 5 year history once or on load
    // In a real app, this would be fetched from an API
    const fullHistory = useMemo(() => generateMockHistory(365 * 2, totalValue), [totalValue]); // Re-generate if totalValue changes drastically, effectively snapping the graph to the new total

    // Generate intraday data when totalValue changes
    const intradayHistory = useMemo(() => generateIntradayHistory(totalValue), [totalValue]);

    const portfolioHistory = useMemo(() => {
        if (timeframe === "1D") {
            return intradayHistory;
        }

        let daysToTake = 365;

        switch (timeframe) {
            case "1W": daysToTake = 7; break;
            case "1M": daysToTake = 30; break;
            case "3M": daysToTake = 90; break;
            case "1Y": daysToTake = 365; break;
            case "ALL": daysToTake = 730; break;
        }

        return fullHistory.slice(-daysToTake);
    }, [fullHistory, intradayHistory, timeframe]);

    // Mock calculations for gains (in a real app, these would come from historical comparisons)
    const daysGain = totalValue * 0.012; // Mock +1.2% day
    const daysGainPercent = 1.2;
    const totalGain = totalValue - 45000; // Assuming 45k was initial investment
    const totalGainPercent = (totalGain / 45000) * 100;

    // Update asset allocation derived from holdings
    const assetAllocation = React.useMemo(() => {
        const allocationMap = new Map<string, number>();

        // Add cash
        allocationMap.set("Cash", buyingPower);

        holdings.forEach(h => {
            const current = allocationMap.get(h.assetClass) || 0;
            allocationMap.set(h.assetClass, current + h.totalValue);
        });

        const colors: Record<string, string> = {
            "Stock": "hsl(var(--chart-1))",
            "Bond": "hsl(var(--chart-2))",
            "Crypto": "hsl(var(--chart-3))",
            "ETF": "hsl(var(--chart-4))",
            "Cash": "hsl(var(--chart-5))",
        };

        return Array.from(allocationMap.entries()).map(([label, value]) => ({
            id: label.toLowerCase(),
            label,
            value,
            color: colors[label] || "#cbd5e1",
        }));
    }, [holdings, buyingPower]);

    const buy = (symbol: string, name: string, quantity: number, price: number, assetClass: "Stock" | "Bond" | "ETF" | "Crypto") => {
        const cost = quantity * price;
        if (cost > buyingPower) {
            alert("Insufficient buying power!");
            return;
        }

        setBuyingPower(prev => prev - cost);

        setHoldings(prev => {
            const existing = prev.find(h => h.symbol === symbol);
            if (existing) {
                // Update existing holding
                const newShares = existing.shares + quantity;
                const newTotalValue = newShares * price; // Simplified: assume new price is current market price
                return prev.map(h => h.symbol === symbol ? {
                    ...h,
                    shares: newShares,
                    price: price,
                    totalValue: newTotalValue,
                } : h);
            } else {
                // Add new holding
                const newHolding: Holding = {
                    id: Math.random().toString(36).substr(2, 9),
                    symbol,
                    name,
                    shares: quantity,
                    price,
                    change: 0, // New positions start flat
                    totalValue: cost,
                    assetClass,
                };
                return [...prev, newHolding];
            }
        });
    };

    const sell = (id: string, quantity: number, price: number) => {
        setHoldings(prev => {
            const holding = prev.find(h => h.id === id);
            if (!holding) return prev;

            const proceeds = quantity * price;
            setBuyingPower(bp => bp + proceeds);

            if (holding.shares <= quantity) {
                // Sold everything
                return prev.filter(h => h.id !== id);
            } else {
                // Partial sell
                return prev.map(h => h.id === id ? {
                    ...h,
                    shares: h.shares - quantity,
                    totalValue: (h.shares - quantity) * price
                } : h);
            }
        });
    };

    return (
        <InvestmentsContext.Provider value={{
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
            sell
        }}>
            {children}
        </InvestmentsContext.Provider>
    );
}
