"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Plus,
  Plane,
  Gift,
  ShoppingBag,
  PartyPopper,
  MoreHorizontal,
  Trash2,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import CalendarHeatmap from "@/components/CalendarHeatmap";
import {
  generateDailySpending,
  mockPlannedEvents,
  mockIncome,
  mockCategories,
  calculateDailyBudget,
} from "@/lib/mock-data";
import { PlannedEvent, DailySpending } from "@/lib/types";

const CATEGORY_ICONS = {
  vacation: Plane,
  holiday: Gift,
  purchase: ShoppingBag,
  event: PartyPopper,
  other: MoreHorizontal,
};

const CATEGORY_COLORS = {
  vacation: "bg-accent-blue/20 text-accent-blue border-accent-blue/30",
  holiday: "bg-accent-red/20 text-accent-red border-accent-red/30",
  purchase: "bg-accent-purple/20 text-accent-purple border-accent-purple/30",
  event: "bg-accent-pink/20 text-accent-pink border-accent-pink/30",
  other: "bg-accent-teal/20 text-accent-teal border-accent-teal/30",
};

export default function PlannerPage() {
  const [events, setEvents] = useState<PlannedEvent[]>(mockPlannedEvents);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DailySpending | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<PlannedEvent>>({
    category: "other",
  });
  const [aiTips, setAiTips] = useState<{
    summary: string;
    tips: { title: string; description: string; priority: string; potentialSavings: number }[];
    encouragement: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [dailySpending, setDailySpending] = useState<DailySpending[]>([]);

  // Generate spending data on client only to avoid hydration mismatch
  useEffect(() => {
    setDailySpending(generateDailySpending());
  }, []);

  // Calculate fixed expenses (housing, insurance, etc.)
  const fixedExpenses = mockCategories
    .filter((c) => ["Housing", "Health"].includes(c.name))
    .reduce((sum, c) => sum + c.amount, 0);

  // Days until end of month
  // Parse YYYY-MM-DD string to local date (avoiding timezone issues)
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const budgetInfo = calculateDailyBudget(mockIncome, fixedExpenses, events, daysRemaining);

  // Spending stats
  const last7Days = dailySpending.slice(-7);
  const last7DaysTotal = last7Days.reduce((sum, d) => sum + d.amount, 0);
  const avgDailySpending = last7DaysTotal / 7;
  const isOverBudget = avgDailySpending > budgetInfo.adjustedForEvents;

  // Upcoming events sorted by date (using local date parsing)
  const upcomingEvents = events
    .filter((e) => parseLocalDate(e.date) >= todayStart)
    .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());

  const handleAddEvent = () => {
    if (newEvent.name && newEvent.date && newEvent.estimatedCost) {
      const event: PlannedEvent = {
        id: Date.now().toString(),
        name: newEvent.name,
        date: newEvent.date,
        estimatedCost: newEvent.estimatedCost,
        category: newEvent.category || "other",
        notes: newEvent.notes,
      };
      setEvents([...events, event]);
      setNewEvent({ category: "other" });
      setShowAddModal(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  // Format date for display using local parsing
  const formatEventDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDaysUntil = (date: string) => {
    const eventDate = parseLocalDate(date);
    const diffTime = eventDate.getTime() - todayStart.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return "Passed";
    return `${diffDays} days`;
  };

  // Mock AI tips for development mode
  const mockAiTips = {
    summary: isOverBudget 
      ? "Your spending is slightly above your daily budget. Let's find some areas to optimize!"
      : "Great job staying within budget! Here are some tips to save even more.",
    tips: [
      {
        title: "Meal prep on weekends",
        description: "Cooking meals in batches can save you up to $150/month on food costs compared to eating out.",
        priority: "high",
        potentialSavings: 150
      },
      {
        title: "Review subscriptions",
        description: "Check for unused streaming services or memberships. Many people forget about services charging monthly.",
        priority: "medium",
        potentialSavings: 50
      },
      {
        title: "Use cashback apps",
        description: "Apps like Rakuten or Honey can give you 1-5% back on purchases you're already making.",
        priority: "low",
        potentialSavings: 30
      }
    ],
    encouragement: upcomingEvents.length > 0 
      ? `You're planning ahead for ${upcomingEvents.length} upcoming event${upcomingEvents.length > 1 ? 's' : ''}—that's smart budgeting!`
      : "Starting to track your spending is the first step to financial freedom. Keep it up!"
  };

  // Fetch AI tips
  const fetchAiTips = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    
    // Use mock data in development to avoid API calls
    if (process.env.NODE_ENV === "development") {
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setAiTips(mockAiTips);
      setAiLoading(false);
      return;
    }
    
    // Build context for AI (production only)
    const spendingSummary = {
      avgDaily7Days: avgDailySpending.toFixed(2),
      baseDailyBudget: budgetInfo.dailyBudget.toFixed(2),
      adjustedDailyBudget: budgetInfo.adjustedForEvents.toFixed(2),
      monthlyIncome: mockIncome,
      plannedEventsCost: budgetInfo.eventsCost.toFixed(2),
      daysRemaining,
      isOverBudget,
      upcomingEvents: upcomingEvents.map(e => ({
        name: e.name,
        date: e.date,
        cost: e.estimatedCost,
        category: e.category
      })),
      last7DaysSpending: dailySpending.slice(-7).map(d => ({
        date: d.date,
        amount: d.amount
      })),
      categories: mockCategories.map(c => ({ name: c.name, amount: c.amount }))
    };

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "budget-tips",
          prompt: `Here's my current financial situation:\n${JSON.stringify(spendingSummary, null, 2)}\n\nPlease analyze my spending and provide personalized budgeting advice.`
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get AI tips");
      }

      const data = await response.json();
      
      // Extract JSON from response (may be wrapped in markdown code blocks)
      let jsonStr = data.response;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      
      const parsed = JSON.parse(jsonStr);
      setAiTips(parsed);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to load AI tips");
    } finally {
      setAiLoading(false);
    }
  }, [avgDailySpending, budgetInfo, daysRemaining, isOverBudget, upcomingEvents, dailySpending, mockAiTips]);

  // Fetch AI tips only after dailySpending is loaded
  useEffect(() => {
    if (dailySpending.length > 0) {
      fetchAiTips();
    }
  }, [dailySpending.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show loading state while data loads
  if (dailySpending.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading spending data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Budget Planner</h1>
        <p className="text-text-secondary">
          Track spending patterns and plan for upcoming expenses
        </p>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-card rounded-xl p-4 border border-border-main">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-accent-green" />
            <span className="text-sm text-text-secondary">Base Daily Budget</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            ${budgetInfo.dailyBudget.toFixed(2)}
          </p>
          <p className="text-xs text-text-secondary mt-1">Without planned events</p>
        </div>

        <div className="bg-bg-card rounded-xl p-4 border border-border-main">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-accent-blue" />
            <span className="text-sm text-text-secondary">Adjusted Daily Budget</span>
          </div>
          <p className={`text-2xl font-bold ${budgetInfo.adjustedForEvents < budgetInfo.dailyBudget ? "text-accent-yellow" : "text-accent-green"}`}>
            ${budgetInfo.adjustedForEvents.toFixed(2)}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {daysRemaining} days remaining this month
          </p>
        </div>

        <div className="bg-bg-card rounded-xl p-4 border border-border-main">
          <div className="flex items-center gap-2 mb-2">
            {isOverBudget ? (
              <TrendingUp className="w-4 h-4 text-accent-red" />
            ) : (
              <TrendingDown className="w-4 h-4 text-accent-green" />
            )}
            <span className="text-sm text-text-secondary">Avg Daily (7 days)</span>
          </div>
          <p className={`text-2xl font-bold ${isOverBudget ? "text-accent-red" : "text-accent-green"}`}>
            ${avgDailySpending.toFixed(2)}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {isOverBudget ? "Above" : "Below"} adjusted budget
          </p>
        </div>

        <div className="bg-bg-card rounded-xl p-4 border border-border-main">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-accent-purple" />
            <span className="text-sm text-text-secondary">Planned Events Cost</span>
          </div>
          <p className="text-2xl font-bold text-accent-purple">
            ${budgetInfo.eventsCost.toFixed(2)}
          </p>
          <p className="text-xs text-text-secondary mt-1">This month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Spending Heatmap */}
        <div className="xl:col-span-2 bg-bg-card rounded-xl p-6 border border-border-main">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Spending Heatmap</h2>
          <p className="text-sm text-text-secondary mb-6">
            Click on any day to see details. Purple squares indicate planned events.
          </p>
          <CalendarHeatmap data={dailySpending} events={events} onDayClick={setSelectedDay} />

          {selectedDay && (
            <div className="mt-6 p-4 bg-bg-secondary rounded-lg border border-border-main">
              <h3 className="font-medium text-text-primary mb-2">
                {parseLocalDate(selectedDay.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Total Spent</p>
                  <p className="text-xl font-bold text-accent-green">${selectedDay.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Transactions</p>
                  <p className="text-xl font-bold text-text-primary">{selectedDay.transactions}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-bg-card rounded-xl p-6 border border-border-main">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Planned Events</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 rounded-lg bg-accent-green/20 text-accent-green hover:bg-accent-green/30 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-text-secondary text-sm py-4 text-center">
                No upcoming events. Add one to adjust your daily budget!
              </p>
            ) : (
              upcomingEvents.map((event) => {
                const Icon = CATEGORY_ICONS[event.category];
                return (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${CATEGORY_COLORS[event.category]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5" />
                        <div>
                          <p className="font-semibold text-text-primary">{event.name}</p>
                          <p className="text-sm text-text-secondary">
                            {formatEventDate(event.date)}{" "}
                            • {getDaysUntil(event.date)}
                          </p>
                          {event.notes && (
                            <p className="text-xs text-text-secondary mt-1">{event.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">${event.estimatedCost}</span>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1 hover:bg-black/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-text-secondary hover:text-text-primary" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* AI-Powered Tips */}
          <div className="mt-6 p-4 bg-gradient-to-br from-accent-purple/10 to-accent-blue/10 rounded-lg border border-accent-purple/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-purple" />
                <h3 className="text-sm font-medium text-text-primary">AI Budget Advisor</h3>
              </div>
              <button
                onClick={fetchAiTips}
                disabled={aiLoading}
                className="p-1.5 rounded-lg hover:bg-bg-card transition-colors disabled:opacity-50"
                title="Refresh tips"
              >
                <RefreshCw className={`w-4 h-4 text-text-secondary ${aiLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            
            {aiLoading && (
              <div className="space-y-2">
                <div className="h-4 bg-bg-card rounded animate-pulse" />
                <div className="h-4 bg-bg-card rounded animate-pulse w-3/4" />
                <div className="h-16 bg-bg-card rounded animate-pulse mt-3" />
              </div>
            )}
            
            {aiError && (
              <p className="text-xs text-accent-red">{aiError}</p>
            )}
            
            {aiTips && !aiLoading && (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">{aiTips.summary}</p>
                
                <div className="space-y-2">
                  {aiTips.tips.map((tip, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        tip.priority === "high"
                          ? "bg-accent-red/10 border-accent-red/30"
                          : tip.priority === "medium"
                          ? "bg-accent-yellow/10 border-accent-yellow/30"
                          : "bg-accent-green/10 border-accent-green/30"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {tip.priority === "high" ? (
                          <AlertTriangle className="w-4 h-4 text-accent-red mt-0.5 flex-shrink-0" />
                        ) : tip.priority === "medium" ? (
                          <Lightbulb className="w-4 h-4 text-accent-yellow mt-0.5 flex-shrink-0" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-text-primary">{tip.title}</p>
                          <p className="text-xs text-text-secondary mt-1">{tip.description}</p>
                          {tip.potentialSavings > 0 && (
                            <p className="text-xs text-accent-green mt-1 font-medium">
                              Potential savings: ${tip.potentialSavings}/month
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {aiTips.encouragement && (
                  <p className="text-xs text-text-secondary italic mt-2">
                    "{aiTips.encouragement}"
                  </p>
                )}
              </div>
            )}

            {/* How it's calculated */}
            <details className="mt-4">
              <summary className="text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                How is your adjusted budget calculated?
              </summary>
              <div className="mt-2 p-3 bg-bg-card rounded-lg text-xs text-text-secondary space-y-1">
                <p><strong className="text-text-primary">Monthly Income:</strong> ${mockIncome.toLocaleString()}</p>
                <p><strong className="text-text-primary">Fixed Expenses:</strong> -${fixedExpenses.toLocaleString()}</p>
                <p><strong className="text-text-primary">Available:</strong> ${(mockIncome - fixedExpenses).toLocaleString()}</p>
                <hr className="border-border-main my-2" />
                <p><strong className="text-text-primary">Base daily:</strong> ${budgetInfo.dailyBudget.toFixed(2)} ({"($"}{(mockIncome - fixedExpenses).toLocaleString()} ÷ 30 days)</p>
                <p><strong className="text-text-primary">Events this month:</strong> -${budgetInfo.eventsCost.toLocaleString()}</p>
                <p><strong className="text-text-primary">Adjusted daily:</strong> ${budgetInfo.adjustedForEvents.toFixed(2)} ({"($"}{(mockIncome - fixedExpenses - budgetInfo.eventsCost).toLocaleString()} ÷ {daysRemaining} days)</p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-card rounded-xl p-6 w-full max-w-md border border-border-main">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Add Planned Event</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Event Name</label>
                <input
                  type="text"
                  value={newEvent.name || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-main rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-green"
                  placeholder="e.g., Summer Vacation"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Date</label>
                <input
                  type="date"
                  value={newEvent.date || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-main rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-green"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Estimated Cost ($)</label>
                <input
                  type="number"
                  value={newEvent.estimatedCost || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, estimatedCost: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-main rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-green"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Category</label>
                <select
                  value={newEvent.category}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, category: e.target.value as PlannedEvent["category"] })
                  }
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-main rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-green"
                >
                  <option value="vacation">Vacation</option>
                  <option value="holiday">Holiday</option>
                  <option value="purchase">Purchase</option>
                  <option value="event">Event</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Notes (optional)</label>
                <textarea
                  value={newEvent.notes || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-main rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-green resize-none"
                  rows={2}
                  placeholder="Any additional details..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-border-main rounded-lg text-text-secondary hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="flex-1 px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-accent-green/90 transition-colors"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
