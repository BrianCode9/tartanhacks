"use client";

import { useMemo, useState } from "react";
import { DailySpending, PlannedEvent } from "@/lib/types";

interface CalendarHeatmapProps {
  data: DailySpending[];
  events?: PlannedEvent[];
  onDayClick?: (day: DailySpending) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Event category colors matching the planner page
const EVENT_COLORS: Record<string, string> = {
  vacation: "bg-accent-blue",
  holiday: "bg-accent-red",
  purchase: "bg-accent-purple",
  event: "bg-accent-pink",
  other: "bg-accent-teal",
};

function getIntensityColor(amount: number, max: number): string {
  if (amount === 0) return "bg-bg-card border border-border-main";
  const ratio = amount / max;
  if (ratio < 0.2) return "bg-accent-green/40";
  if (ratio < 0.4) return "bg-accent-green/60";
  if (ratio < 0.6) return "bg-accent-yellow/60";
  if (ratio < 0.8) return "bg-accent-yellow/80";
  return "bg-accent-red/80";
}

function getEventColor(category: string): string {
  return EVENT_COLORS[category] || EVENT_COLORS.other;
}

function getIntensityLabel(amount: number, max: number): string {
  if (amount === 0) return "No spending";
  const ratio = amount / max;
  if (ratio < 0.2) return "Very low";
  if (ratio < 0.4) return "Low";
  if (ratio < 0.6) return "Moderate";
  if (ratio < 0.8) return "High";
  return "Very high";
}

function getIntensityTextColor(amount: number, max: number): string {
  if (amount === 0) return "text-text-secondary";
  const ratio = amount / max;
  if (ratio < 0.2) return "text-accent-green";
  if (ratio < 0.4) return "text-accent-green";
  if (ratio < 0.6) return "text-accent-yellow";
  if (ratio < 0.8) return "text-accent-yellow";
  return "text-accent-red";
}

interface DayData extends DailySpending {
  event?: PlannedEvent;
  dayOfMonth: number;
}

// Format date to YYYY-MM-DD string
function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface MonthData {
  year: number;
  month: number;
  weeks: (DayData | null)[][];
}

export default function CalendarHeatmap({ data, events = [], onDayClick }: CalendarHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Create maps for quick lookup
  const dataMap = useMemo(() => new Map(data.map((d) => [d.date, d])), [data]);
  const eventsMap = useMemo(() => {
    const map = new Map<string, PlannedEvent>();
    events.forEach((event) => map.set(event.date, event));
    return map;
  }, [events]);

  const maxAmount = useMemo(() => Math.max(...data.map((d) => d.amount), 1), [data]);

  // Generate months to display (past 3 months + current + next 2 months)
  const months: MonthData[] = useMemo(() => {
    const result: MonthData[] = [];
    const today = new Date();
    
    // Start from 3 months ago
    const startMonth = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    // End at 2 months ahead
    const endMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    
    const currentMonth = new Date(startMonth);
    
    while (currentMonth <= endMonth) {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // Get first day of month and how many days
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDayOfWeek = firstDay.getDay();
      
      // Build weeks for this month
      const weeks: (DayData | null)[][] = [];
      let currentWeek: (DayData | null)[] = [];
      
      // Add empty cells for days before the 1st
      for (let i = 0; i < startDayOfWeek; i++) {
        currentWeek.push(null);
      }
      
      // Add each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(year, month, day);
        const dayData = dataMap.get(dateStr);
        const event = eventsMap.get(dateStr);
        
        const dayInfo: DayData = {
          date: dateStr,
          amount: dayData?.amount || 0,
          transactions: dayData?.transactions || 0,
          event,
          dayOfMonth: day,
        };
        
        currentWeek.push(dayInfo);
        
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }
      
      // Add remaining days to complete last week
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
      }
      
      result.push({ year, month, weeks });
      
      // Move to next month
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    
    return result;
  }, [dataMap, eventsMap]);

  const handleMouseEnter = (day: DayData | null, e: React.MouseEvent) => {
    if (day) {
      setHoveredDay(day);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setTooltipPos({ x: rect.left, y: rect.top });
    }
  };

  return (
    <div className="relative">
      {/* Month grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {months.map((monthData) => (
          <div key={`${monthData.year}-${monthData.month}`} className="bg-bg-secondary rounded-lg p-4">
            {/* Month header */}
            <h3 className="text-sm font-semibold text-text-primary mb-3 text-center">
              {MONTH_NAMES[monthData.month]} {monthData.year}
            </h3>
            
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-xs text-text-secondary text-center font-medium">
                  {day.slice(0, 1)}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="space-y-1">
              {monthData.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1">
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return <div key={dayIndex} className="w-full aspect-square" />;
                    }
                    
                    const bgColor = day.event 
                      ? getEventColor(day.event.category)
                      : getIntensityColor(day.amount, maxAmount);
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`w-full aspect-square rounded cursor-pointer transition-all hover:ring-2 hover:ring-text-primary/50 hover:scale-110 relative flex items-center justify-center ${bgColor}`}
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => onDayClick?.(day)}
                      >
                        <span className={`text-xs font-medium ${day.event ? "text-white" : day.amount > 0 ? "text-white/80" : "text-text-secondary"}`}>
                          {day.dayOfMonth}
                        </span>
                        {day.event && (
                          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                            <div className="w-1 h-1 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 text-sm text-text-secondary flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <span>Spending:</span>
          <div className="flex gap-1 items-center">
            <span className="text-xs">Low</span>
            <div className="w-4 h-4 rounded bg-accent-green/40" />
            <div className="w-4 h-4 rounded bg-accent-green/60" />
            <div className="w-4 h-4 rounded bg-accent-yellow/60" />
            <div className="w-4 h-4 rounded bg-accent-yellow/80" />
            <div className="w-4 h-4 rounded bg-accent-red/80" />
            <span className="text-xs">High</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Events:</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-accent-blue" title="Vacation" />
            <div className="w-4 h-4 rounded bg-accent-red" title="Holiday" />
            <div className="w-4 h-4 rounded bg-accent-purple" title="Purchase" />
            <div className="w-4 h-4 rounded bg-accent-pink" title="Event" />
            <div className="w-4 h-4 rounded bg-accent-teal" title="Other" />
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 px-4 py-3 bg-bg-card border border-border-main rounded-xl shadow-xl pointer-events-none min-w-[200px]"
          style={{
            left: Math.min(tooltipPos.x + 30, window.innerWidth - 220),
            top: tooltipPos.y - 80,
          }}
        >
          <p className="text-sm font-medium text-text-primary mb-1">
            {MONTH_NAMES[parseInt(hoveredDay.date.split("-")[1]) - 1]} {hoveredDay.dayOfMonth}, {hoveredDay.date.split("-")[0]}
          </p>
          {hoveredDay.event ? (
            <div className={`mt-2 p-2 rounded-lg ${
              hoveredDay.event.category === "vacation" ? "bg-accent-blue/20" :
              hoveredDay.event.category === "holiday" ? "bg-accent-red/20" :
              hoveredDay.event.category === "purchase" ? "bg-accent-purple/20" :
              hoveredDay.event.category === "event" ? "bg-accent-pink/20" :
              "bg-accent-teal/20"
            }`}>
              <p className={`text-sm font-bold ${
                hoveredDay.event.category === "vacation" ? "text-accent-blue" :
                hoveredDay.event.category === "holiday" ? "text-accent-red" :
                hoveredDay.event.category === "purchase" ? "text-accent-purple" :
                hoveredDay.event.category === "event" ? "text-accent-pink" :
                "text-accent-teal"
              }`}>{hoveredDay.event.name}</p>
              <p className="text-lg font-bold text-text-primary">${hoveredDay.event.estimatedCost}</p>
              <p className="text-xs text-text-secondary capitalize">{hoveredDay.event.category}</p>
              {hoveredDay.event.notes && (
                <p className="text-xs text-text-secondary mt-1">{hoveredDay.event.notes}</p>
              )}
            </div>
          ) : (
            <>
              <p className={`text-xl font-bold ${getIntensityTextColor(hoveredDay.amount, maxAmount)}`}>${hoveredDay.amount.toFixed(2)}</p>
              <p className="text-xs text-text-secondary mt-1">
                {hoveredDay.transactions} transaction{hoveredDay.transactions !== 1 ? "s" : ""} •{" "}
                {getIntensityLabel(hoveredDay.amount, maxAmount)}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
