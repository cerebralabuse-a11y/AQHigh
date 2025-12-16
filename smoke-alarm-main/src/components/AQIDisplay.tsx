import { MapPin, Wind, Droplets } from "lucide-react";

interface AQIDisplayProps {
  aqi: number;
  city: string;
  category: string;
  cigaretteCount: number;
}

const AQIDisplay = ({ aqi, city, category, cigaretteCount }: AQIDisplayProps) => {
  return (
    <div className="space-y-4">
      {/* Location */}
      <div className="flex items-center gap-2 text-foreground/70">
        <MapPin className="w-4 h-4" />
        <span className="text-sm font-medium">{city}</span>
      </div>

      {/* Main AQI Display */}
      <div className="flex items-end justify-between">
        <div className="relative">
          <span className="font-display text-7xl font-bold text-foreground leading-none relative z-10">
            {aqi}
          </span>
          <div className="absolute inset-0 blur-xl opacity-30">
            <span className="font-display text-7xl font-bold text-foreground leading-none">
              {aqi}
            </span>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex gap-3 pb-2">
          <div className="neumorphic-blend px-4 py-3 rounded-2xl transform hover:scale-105 transition-transform">
            <p className="text-[10px] text-foreground/60 uppercase tracking-wider font-semibold mb-1">Cigs</p>
            <p className="text-base font-bold text-foreground">{cigaretteCount.toFixed(1)}</p>
          </div>
          <div className="neumorphic-blend px-4 py-3 rounded-2xl transform hover:scale-105 transition-transform">
            <p className="text-[10px] text-foreground/60 uppercase tracking-wider font-semibold mb-1">Status</p>
            <p className="text-base font-bold text-foreground">{getShortCategory(category)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const getShortCategory = (category: string): string => {
  if (category.includes("Good")) return "Good";
  if (category.includes("Moderate")) return "Okay";
  if (category.includes("Sensitive")) return "Risky";
  if (category.includes("Unhealthy")) return "Bad";
  if (category.includes("Very")) return "V.Bad";
  return "Danger";
};

export default AQIDisplay;