"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCcw, Sparkles, Target, Clock, TrendingUp, AlertCircle } from "lucide-react";

interface Recommendation {
    title: string;
    description: string;
    allocation: string;
    priority: "high" | "medium" | "low";
    timeframe: "immediate" | "short-term" | "long-term";
}

interface AISavingsData {
    headline: string;
    recommendations: Recommendation[];
    monthlyPlan: string;
    projectedGrowth: string;
}

interface AISavingsAdviceProps {
    surplus: number;
    riskLevel: "conservative" | "moderate" | "aggressive";
    emergencyFundTarget: number;
    income: number;
}

// Cache per risk level
const adviceCache: Record<string, { data: AISavingsData | null; timestamp: number; loading: boolean }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Preload function that can be called from parent component
export async function preloadAISavingsAdvice(
    surplus: number,
    riskLevel: string,
    emergencyFundTarget: number,
    income: number
) {
    const cacheKey = `${riskLevel}-${surplus}`;

    // Skip if already cached or loading
    if (adviceCache[cacheKey]?.loading || (adviceCache[cacheKey]?.data && Date.now() - adviceCache[cacheKey].timestamp < CACHE_DURATION)) {
        return;
    }

    adviceCache[cacheKey] = { data: null, timestamp: 0, loading: true };

    try {
        const prompt = `User Profile:
- Monthly Surplus: $${surplus.toLocaleString()}
- Risk Tolerance: ${riskLevel}
- Emergency Fund Target: $${emergencyFundTarget.toLocaleString()} (6 months expenses)
- Monthly Income: $${income.toLocaleString()}
- Annual Investment Potential: $${(surplus * 12).toLocaleString()}

Provide personalized investment and savings advice for this ${riskLevel} investor with a $${surplus}/month surplus.`;

        const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, type: "savings-advice" }),
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
                adviceCache[cacheKey].data = JSON.parse(content.trim());
            } catch {
                adviceCache[cacheKey].data = {
                    headline: "AI Analysis Complete",
                    recommendations: [{ title: "Analysis", description: data.response, allocation: "N/A", priority: "medium" as const, timeframe: "short-term" as const }],
                    monthlyPlan: "Review the detailed analysis above.",
                    projectedGrowth: "Varies based on implementation.",
                };
            }
            adviceCache[cacheKey].timestamp = Date.now();
        }
    } catch (e) {
        console.warn("Preload AI savings advice failed:", e);
    } finally {
        adviceCache[cacheKey].loading = false;
    }
}

export default function AISavingsAdvice({ surplus, riskLevel, emergencyFundTarget, income }: AISavingsAdviceProps) {
    const [advice, setAdvice] = useState<AISavingsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef<Record<string, boolean>>({});

    const fetchAdvice = async (force = false) => {
        const cacheKey = `${riskLevel}-${surplus}`;

        // Check cache first
        if (!force && adviceCache[cacheKey]?.data && Date.now() - adviceCache[cacheKey].timestamp < CACHE_DURATION) {
            setAdvice(adviceCache[cacheKey].data);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const prompt = `User Profile:
- Monthly Surplus: $${surplus.toLocaleString()}
- Risk Tolerance: ${riskLevel}
- Emergency Fund Target: $${emergencyFundTarget.toLocaleString()} (6 months expenses)
- Monthly Income: $${income.toLocaleString()}
- Annual Investment Potential: $${(surplus * 12).toLocaleString()}

Provide personalized investment and savings advice for this ${riskLevel} investor with a $${surplus}/month surplus.`;

            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, type: "savings-advice" }),
            });

            if (!res.ok) {
                throw new Error(`API error: ${res.status}`);
            }

            const data = await res.json();

            let parsed: AISavingsData;
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
                    headline: "AI Analysis Complete",
                    recommendations: [{ title: "Analysis", description: data.response, allocation: "N/A", priority: "medium", timeframe: "short-term" }],
                    monthlyPlan: "Review the detailed analysis above.",
                    projectedGrowth: "Varies based on implementation.",
                };
            }

            // Cache the result
            adviceCache[cacheKey] = { data: parsed, timestamp: Date.now(), loading: false };
            setAdvice(parsed);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get AI advice");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cacheKey = `${riskLevel}-${surplus}`;
        if (!hasFetched.current[cacheKey]) {
            hasFetched.current[cacheKey] = true;
            fetchAdvice();
        } else if (adviceCache[cacheKey]?.data) {
            setAdvice(adviceCache[cacheKey].data);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [riskLevel, surplus]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "border-accent-green/30 bg-accent-green/5";
            case "medium":
                return "border-accent-blue/30 bg-accent-blue/5";
            default:
                return "border-accent-purple/30 bg-accent-purple/5";
        }
    };

    const getTimeframeIcon = (timeframe: string) => {
        switch (timeframe) {
            case "immediate":
                return <AlertCircle className="w-4 h-4 text-accent-green" />;
            case "short-term":
                return <Clock className="w-4 h-4 text-accent-blue" />;
            default:
                return <Target className="w-4 h-4 text-accent-purple" />;
        }
    };

    // Skeleton loading component with spinner
    const SkeletonLoader = () => (
        <div className="space-y-4">
            {/* Prominent spinning loader */}
            <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-accent-purple/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-accent-purple rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-text-secondary">Generating personalized advice...</p>
                </div>
            </div>
            {/* Skeleton cards */}
            <div className="space-y-3 animate-pulse">
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
                    onClick={() => fetchAdvice(true)}
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
                        onClick={() => fetchAdvice(true)}
                        className="mt-2 text-sm text-accent-red underline hover:no-underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {advice && !loading && (
                <div className="space-y-4">
                    {/* Headline */}
                    <div className="bg-bg-secondary rounded-lg p-4 border border-border-main">
                        <p className="text-lg font-medium text-text-primary">{advice.headline}</p>
                    </div>

                    {/* Recommendations */}
                    <div className="grid gap-3">
                        {advice.recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className={`rounded-lg p-4 border ${getPriorityColor(rec.priority)}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getTimeframeIcon(rec.timeframe)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-medium text-text-primary">{rec.title}</h3>
                                            <span className="text-sm font-semibold text-accent-green">
                                                {rec.allocation}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-secondary">{rec.description}</p>
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-xs px-2 py-0.5 rounded bg-bg-card text-text-secondary capitalize">
                                                {rec.timeframe}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Monthly Plan */}
                    <div className="bg-accent-green/10 border border-accent-green/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-accent-green" />
                            <span className="font-medium text-accent-green">Monthly Action Plan</span>
                        </div>
                        <p className="text-sm text-text-primary">{advice.monthlyPlan}</p>
                    </div>

                    {/* Projected Growth */}
                    <div className="text-center py-3 text-sm text-text-secondary italic">
                        📈 {advice.projectedGrowth}
                    </div>
                </div>
            )}
        </div>
    );
}
