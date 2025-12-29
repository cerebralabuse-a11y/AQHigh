import React from 'react';
import { cn } from "@/lib/utils";

interface DailyForecast {
    day: string;
    avg: number;
    max: number;
    min: number;
}

interface AQIStreakProps {
    forecast: DailyForecast[];
    className?: string;
}

const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]";
    if (aqi <= 100) return "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.4)]";
    if (aqi <= 150) return "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.4)]";
    if (aqi <= 200) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]";
    if (aqi <= 300) return "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]";
    return "bg-rose-900 shadow-[0_0_10px_rgba(136,19,55,0.4)]";
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: 'short' });

    return date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
};

const AQIStreak: React.FC<AQIStreakProps> = ({ forecast, className }) => {
    // The WAQI API provides forecast data, but we'll treat it as historical/current data
    // Sort by date to show most recent first (reverse chronological order)
    const sortedData = [...forecast].sort((a, b) => {
        return new Date(b.day).getTime() - new Date(a.day).getTime();
    });

    // Take up to 7 most recent days
    const displayData = sortedData.slice(0, 7);

    if (displayData.length === 0) return null;

    return (
        <div className={cn("neumorphic-blend p-4 rounded-2xl w-full", className)}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 font-display">
                    Recent Days
                </h3>
                <span className="text-[10px] text-foreground/40 font-medium">
                    Past 7 Days
                </span>
            </div>

            <div className="flex items-end justify-between gap-3 md:gap-4 px-1">
                {displayData.map((item) => {
                    const isToday = formatDate(item.day) === "Today";
                    const dayLabel = formatDate(item.day).charAt(0); // M, T, W...

                    return (
                        <div key={item.day} className="group relative flex flex-col items-center gap-1.5 flex-1 cursor-help">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-20 pointer-events-none">
                                <div className="bg-popover text-popover-foreground text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl border border-border/50">
                                    <p className="font-bold mb-0.5">{formatDate(item.day)}</p>
                                    <p className="text-muted-foreground">Avg: <span className="text-foreground font-semibold">{item.avg}</span></p>
                                    <p className="text-muted-foreground text-[9px]">Range: {item.min}-{item.max}</p>
                                </div>
                                {/* Tooltip Arrow */}
                                <div className="w-2 h-2 bg-popover border-b border-r border-border/50 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                            </div>

                            {/* Bar/Circle */}
                            <div
                                className={cn(
                                    "rounded-full transition-all duration-300 shadow-sm border border-white/30",
                                    getAQIColor(item.avg),
                                    isToday
                                        ? "w-4 h-4 md:w-5 md:h-5 ring-2 ring-offset-2 ring-offset-white/20 ring-primary/40 scale-110"
                                        : "w-3 h-3 md:w-4 md:h-4 opacity-90 hover:opacity-100 hover:scale-125 hover:ring-2 hover:ring-white/40"
                                )}
                            />

                            {/* Day Label */}
                            <span className={cn(
                                "text-[10px] sm:text-xs",
                                isToday ? "font-bold text-foreground" : "font-medium text-foreground/70 group-hover:text-foreground"
                            )}>
                                {dayLabel}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AQIStreak;
