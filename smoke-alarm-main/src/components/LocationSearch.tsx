import { useEffect, useState } from "react";
import { MapPin, Search, Loader2, Building2, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WAQI_TOKEN } from "@/hooks/useAQI";

interface LocationSearchProps {
  onSearch: (city: string) => void;
  onUseCurrentLocation: () => void;
  isLoading: boolean;
  currentCity: string;
}

interface SearchResult {
  id: string;
  label: string;
  subLabel?: string;
  value: string; // The value to search with (station url or geo:lat;lng)
  type: 'station' | 'city';
  aqi?: string;
}

const LocationSearch = ({
  onSearch,
  onUseCurrentLocation,
  isLoading,
  currentCity
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

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const term = searchValue.trim();
        const encodedTerm = encodeURIComponent(term);

        // Run both searches in parallel:
        // 1. WAQI for accurate station data
        // 2. Open-Meteo for broad city searching
        const [waqiRes, geoRes] = await Promise.allSettled([
          fetch(`https://api.waqi.info/search/?keyword=${encodedTerm}&token=${WAQI_TOKEN}`, { signal: controller.signal }),
          fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodedTerm}&count=5`, { signal: controller.signal })
        ]);

        const newSuggestions: SearchResult[] = [];

        // Process WAQI Results (Specific Stations)
        if (waqiRes.status === "fulfilled" && waqiRes.value.ok) {
          const data = await waqiRes.value.json();
          if (data.status === "ok" && Array.isArray(data.data)) {
            data.data.slice(0, 3).forEach((item: any) => {
              newSuggestions.push({
                id: `waqi-${item.uid}`,
                label: item.station.name,
                value: item.station.url || item.station.name,
                type: 'station',
                aqi: item.aqi
              });
            });
          }
        }

        // Process Geocoding Results (Broad Cities)
        if (geoRes.status === "fulfilled" && geoRes.value.ok) {
          const data = await geoRes.value.json();
          if (data.results && Array.isArray(data.results)) {
            const seenCoords = new Set();
            data.results.forEach((item: any) => {
              // Primitive deduplication against WAQI results isn't easy without proximity check,
              // so we just rely on visual distinction.
              const coordKey = `${item.latitude.toFixed(1)},${item.longitude.toFixed(1)}`;
              if (seenCoords.has(coordKey)) return;
              seenCoords.add(coordKey);

              newSuggestions.push({
                id: `geo-${item.id}`,
                label: item.name,
                subLabel: [item.admin1, item.country].filter(Boolean).join(", "),
                value: `geo:${item.latitude};${item.longitude}`,
                type: 'city'
              });
            });
          }
        }

        if (!controller.signal.aborted) {
          setSuggestions(newSuggestions);
        }

      } catch (error) {
        // silent error to avoid UI disruption
      } finally {
        if (!controller.signal.aborted) {
          setIsSuggesting(false);
        }
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
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
              placeholder="Enter city or station name..."
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
                    onSearch(s.value);
                    setSearchValue("");
                    setIsExpanded(false);
                    setSuggestions([]);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-background/80 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                  disabled={isLoading}
                >
                  <div className="mt-0.5 self-start pt-1">
                    {s.type === 'station' ? (
                      <RadioTower className="w-4 h-4 text-primary/70" />
                    ) : (
                      <Building2 className="w-4 h-4 text-foreground/40" />
                    )}
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
                    {s.aqi && s.aqi !== "-" && (
                      <div className="text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
                        AQI: <span className={`font-semibold px-1 rounded ${Number(s.aqi) < 50 ? 'bg-green-500/20 text-green-700' : Number(s.aqi) < 100 ? 'bg-yellow-500/20 text-yellow-700' : 'bg-red-500/20 text-red-700'}`}>{s.aqi}</span>
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