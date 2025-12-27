import { useEffect } from "react";
import LocationSearch from "@/components/LocationSearch";
import AQIDisplay from "@/components/AQIDisplay";
import CigaretteDisplay from "@/components/CigaretteDisplay";
import TweetButton from "@/components/TweetButton";
import ShareExperience from "@/components/ShareExperience";
import PollutantList from "@/components/PollutantList";
import AnimeSkyBackground from "@/components/AnimeSkyBackground";
import AQIStreak from "@/components/AQIStreak";
import { useAQI } from "@/hooks/useAQI";

const Index = () => {
  const { data, isLoading, fetchAQIByCity, fetchAQIByLocation } = useAQI();

  useEffect(() => {
    fetchAQIByCity("Delhi");
  }, [fetchAQIByCity]);

  const isAboveSafeLimit = data ? data.aqi > 50 : false;
  const showLoadingState = isLoading && !data;

  // Background is now handled by AnimeSkyBackground, but we keep the wrapper for specific font/layout properties
  return (
    <div className="min-h-screen min-h-dvh safe-area-inset relative overflow-hidden text-foreground selection:bg-primary/20">
      <AnimeSkyBackground aqi={data?.aqi ?? 50} cigarettes={data?.cigaretteEquivalent ?? 0} />
      <main className="relative z-10 container max-w-md mx-auto px-5 py-8 flex flex-col min-h-screen min-h-dvh">
        {/* Header Section */}
        <header className="pt-4 pb-8 relative">
          <p className="font-display text-2xl font-light text-foreground/90 leading-tight relative z-10">
            {isAboveSafeLimit ? (
              <>
                You're<br />
                <span className="font-semibold text-foreground text-glow">smoking</span><br />
                today
              </>
            ) : (
              <>
                Air is<br />
                <span className="font-semibold text-foreground">clean</span><br />
                today
              </>
            )}
          </p>
          <div className="absolute top-0 left-0 w-32 h-32 bg-foreground/5 rounded-full blur-3xl -z-0" />
        </header>

        {/* Main Visual - Cigarette Display */}
        <div className="flex-1 flex items-center justify-center py-8">
          {data && (
            <div className="animate-count-up">
              <CigaretteDisplay
                count={Math.ceil(data.cigaretteEquivalent)}
                isActive={isAboveSafeLimit}
              />
            </div>
          )}

          {showLoadingState && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-3 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Checking air quality...</p>
            </div>
          )}

          {!isLoading && !data && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-foreground/60 text-sm text-center">
                Unable to load air quality data.<br />
                Please check your connection and try again.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Section - Stats & Controls */}
        <div className="space-y-6 pb-4">
          {/* Location & AQI */}
          {data && (
            <div className="animate-fade-in">
              <AQIDisplay
                aqi={data.aqi}
                city={data.city}
                category={data.category}
                cigaretteCount={data.cigaretteEquivalent}
              />
            </div>
          )}

          {/* Location Search */}
          <LocationSearch
            onSearch={fetchAQIByCity}
            onUseCurrentLocation={fetchAQIByLocation}
            isLoading={isLoading}
            currentCity={data?.city || ""}
          />

          {/* Weekly Streak/Forecast */}
          {data && data.forecast && data.forecast.length > 0 && (
            <div className="animate-fade-in delay-100">
              <AQIStreak forecast={data.forecast} />
            </div>
          )}

          {/* Tweet Button */}
          {data && (
            <div className="animate-count-up" style={{ animationDelay: '0.2s' }}>
              <TweetButton
                cigaretteCount={data.cigaretteEquivalent}
                aqi={data.aqi}
                city={data.city}
                pollutants={data.pollutants}
              />
            </div>
          )}

          {/* Share Experience Button */}
          {data && (
            <div className="animate-count-up" style={{ animationDelay: '0.25s' }}>
              <ShareExperience
                aqi={data.aqi}
                cigarettes={data.cigaretteEquivalent}
                city={data.city}
              />
            </div>
          )}

          {/* Major Pollutants Breakdown */}
          {data && data.pollutants && (
            <PollutantList pollutants={data.pollutants} />
          )}

          {/* Footer */}
          <footer className="text-center pt-8 pb-4">
            <p className="text-xs text-foreground/50">
              1 cigarette ≈ AQI 22/day • Berkeley Earth Study
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;