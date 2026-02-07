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

// Use absolute thresholds for spending colors (not relative to max)
// Based on a reasonable daily budget of ~$100
function getIntensityColor(amount: number): string {
  if (amount === 0) return "bg-accent-green/30";     // No spending - light green (good!)
  if (amount < 50) return "bg-accent-green/50";      // Very low - green
  if (amount < 100) return "bg-accent-green/80";     // Low - darker green  
  if (amount < 150) return "bg-accent-yellow/60";    // Moderate - yellow
  if (amount < 250) return "bg-accent-yellow/90";    // High - orange/yellow
  return "bg-accent-red/80";                          // Very high - red
}

function getEventColor(category: string): string {
  return EVENT_COLORS[category] || EVENT_COLORS.other;
}

function getIntensityLabel(amount: number): string {
  if (amount === 0) return "No spending - great!";
  if (amount < 50) return "Very low";
  if (amount < 100) return "Low";
  if (amount < 150) return "Moderate";
  if (amount < 250) return "High";
  return "Very high";
}

function getIntensityTextColor(amount: number): string {
  if (amount === 0) return "text-accent-green";      // $0 is good!
  if (amount < 50) return "text-accent-green";
  if (amount < 100) return "text-accent-green";
  if (amount < 150) return "text-accent-yellow";
  if (amount < 250) return "text-accent-yellow";
  return "text-accent-red";
}

interface DayData extends DailySpending {
  event?: PlannedEvent;
  dayOfMonth: number;
  isFuture: boolean;
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
        const dayDate = new Date(year, month, day);
        const isFuture = dayDate > today;
        
        const dayInfo: DayData = {
          date: dateStr,
          amount: dayData?.amount || 0,
          transactions: dayData?.transactions || 0,
          event,
          dayOfMonth: day,
          isFuture,
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
                    
                    // Future dates without events show neutral, future with events show event color
                    const bgColor = day.event 
                      ? getEventColor(day.event.category)
                      : day.isFuture 
                        ? "bg-bg-card border border-border-main"  // Future: neutral
                        : getIntensityColor(day.amount);           // Past: spending-based
                    
                    // Determine text color based on background
                    const textColor = day.event 
                      ? "text-white" 
                      : day.isFuture
                        ? "text-text-secondary"  // Future: muted text
                        : day.amount === 0 
                          ? "text-accent-green"  // $0 past: dark green text on light green bg
                          : "text-white/90";     // Spending: white text on colored bg
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`w-full aspect-square rounded cursor-pointer transition-all hover:ring-2 hover:ring-text-primary/50 hover:scale-110 relative flex items-center justify-center ${bgColor}`}
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => onDayClick?.(day)}
                      >
                        <span className={`text-xs font-medium ${textColor}`}>
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
            <span className="text-xs">$0</span>
            <div className="w-4 h-4 rounded bg-accent-green/30" title="$0" />
            <div className="w-4 h-4 rounded bg-accent-green/50" title="< $50" />
            <div className="w-4 h-4 rounded bg-accent-green/80" title="$50-100" />
            <div className="w-4 h-4 rounded bg-accent-yellow/60" title="$100-150" />
            <div className="w-4 h-4 rounded bg-accent-yellow/90" title="$150-250" />
            <div className="w-4 h-4 rounded bg-accent-red/80" title="> $250" />
            <span className="text-xs">$250+</span>
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
          ) : hoveredDay.isFuture && !hoveredDay.event ? (
            <p className="text-sm text-text-secondary">No data yet</p>
          ) : (
            <>
              <p className={`text-xl font-bold ${getIntensityTextColor(hoveredDay.amount)}`}>${hoveredDay.amount.toFixed(2)}</p>
              <p className="text-xs text-text-secondary mt-1">
                {hoveredDay.transactions} transaction{hoveredDay.transactions !== 1 ? "s" : ""} •{" "}
                {getIntensityLabel(hoveredDay.amount)}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
