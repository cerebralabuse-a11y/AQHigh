import { useEffect, useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LocationSearchProps {
  onSearch: (city: string) => void;
  onUseCurrentLocation: () => void;
  isLoading: boolean;
  currentCity: string;
}

interface CitySuggestion {
  name: string;
  country?: string;
  admin1?: string;
}

const LocationSearch = ({ 
  onSearch, 
  onUseCurrentLocation, 
  isLoading, 
  currentCity 
}: LocationSearchProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (searchValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsSuggesting(true);
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchValue.trim())}&count=5`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Geocoding failed");
        const data = await res.json();
        setSuggestions(data?.results || []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSuggesting(false);
        }
      }
    }, 250); // light debounce

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchValue]);

  const formatSuggestionLabel = (s: CitySuggestion) => {
    const parts = [s.name, s.admin1, s.country].filter(Boolean);
    return parts.join(", ");
  };

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
            <div className="text-xs text-foreground/40 px-1">Searching…</div>
          )}

          {!isSuggesting && suggestions.length > 0 && (
            <div className="bg-background/30 border border-border/30 rounded-xl divide-y divide-border/30 overflow-hidden backdrop-blur-md">
              {suggestions.map((s, idx) => (
                <button
                  key={`${s.name}-${s.admin1}-${s.country}-${idx}`}
                  type="button"
                  onClick={() => {
                    // Use the plain city name to improve geocoding hit rate
                    onSearch(s.name);
                    setSearchValue("");
                    setIsExpanded(false);
                    setSuggestions([]);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-background/80 transition-colors"
                  disabled={isLoading}
                >
                  <div className="text-sm text-foreground">{formatSuggestionLabel(s)}</div>
                  {s.country && (
                    <div className="text-xs text-foreground/50">
                      {s.country}
                    </div>
                  )}
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