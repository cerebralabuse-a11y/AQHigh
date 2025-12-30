import { useEffect, useState } from "react";
import { MapPin, Search, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchCities } from "@/services/openWeatherService";

interface LocationSearchProps {
  onSearch: (city: string, coords?: { lat: number; lng: number }) => void;
  onUseCurrentLocation: () => void;
  isLoading: boolean;
  currentCity: string;
}

interface SearchResult {
  id: string;
  label: string;
  subLabel?: string;
  value: string;
  type: 'city';
  coords: { lat: number; lng: number };
}

const LocationSearch = ({
  onSearch,
  onUseCurrentLocation,
  isLoading,
}: LocationSearchProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (searchValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const locations = await searchCities(searchValue.trim());
        const mapped = locations.map((loc, index) => ({
          id: `ow-${index}-${loc.lat}-${loc.lon}`,
          label: loc.name,
          subLabel: [loc.state, loc.country].filter(Boolean).join(", "),
          value: loc.name,
          type: 'city' as const,
          coords: { lat: loc.lat, lng: loc.lon }
        }));
        setSuggestions(mapped);
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setIsSuggesting(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
      setSearchValue("");
      setIsExpanded(false);
      setSuggestions([]);
    }
  };

  return (
    <div className="w-full space-y-3">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full neumorphic-blend px-4 py-3 rounded-2xl flex items-center justify-between hover:bg-card/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 text-foreground/70">
            <Search className="w-4 h-4" />
            <span className="text-sm">Search another city...</span>
          </div>
          <MapPin className="w-4 h-4 text-foreground/40" />
        </button>
      ) : (
        <div className="neumorphic-blend p-4 rounded-2xl space-y-3 animate-fade-in">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter city name..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 bg-background/30 border-border/30 rounded-xl focus:border-foreground/20 focus:bg-background/40 backdrop-blur-md"
              disabled={isLoading}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !searchValue.trim()}
              className="rounded-xl bg-foreground text-background hover:bg-foreground/90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </form>

          {/* Suggestions */}
          {isSuggesting && (
            <div className="text-xs text-foreground/40 px-1">Searching...</div>
          )}

          {!isSuggesting && suggestions.length > 0 && (
            <div className="bg-background/30 border border-border/30 rounded-xl divide-y divide-border/30 overflow-hidden backdrop-blur-md max-h-[300px] overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onSearch(s.label, s.coords);
                    setSearchValue("");
                    setIsExpanded(false);
                    setSuggestions([]);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-background/80 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                  disabled={isLoading}
                >
                  <div className="mt-0.5 self-start pt-1">
                    <Building2 className="w-4 h-4 text-foreground/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-medium truncate">
                      {s.label}
                    </div>
                    {s.subLabel && (
                      <div className="text-xs text-foreground/50 truncate">
                        {s.subLabel}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 rounded-xl text-foreground/60 hover:text-foreground hover:bg-background/50"
              onClick={onUseCurrentLocation}
              disabled={isLoading}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Use GPS
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-foreground/40 hover:text-foreground hover:bg-background/50"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;