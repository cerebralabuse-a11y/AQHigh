import { useState, useCallback } from "react";
import { toast } from "sonner";
import { getAirPollution, calculateEPAAQI, searchCities, reverseGeocode, getAirPollutionHistory, getAirPollutionForecast, PollutionComponents } from "@/services/openWeatherService";
import { Geolocation } from '@capacitor/geolocation';

interface Pollutant {
  value: number;
  name: string;
  unit: string;
  severity?: 'good' | 'moderate' | 'unhealthy';
}

interface AQIData {
  aqi: number;
  category: string;
  city: string;
  cigaretteEquivalent: number;
  pollutants: Record<string, Pollutant>;
  forecast: DailyForecast[]; // Keep interface for compatibility, though OpenWeather air forecast is different
}

export interface DailyForecast {
  day: string;
  avg: number;
  max: number;
  min: number;
}

// AQI categories based on US EPA standards
const getCategory = (aqi: number): string => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

// Research: 22 µg/m³ of PM2.5 ≈ 1 cigarette
const calculateCigaretteEquivalent = (pm25: number): number => {
  return pm25 / 22;
};

const DEFAULT_CITY = "Delhi";

export const useAQI = () => {
  const [data, setData] = useState<AQIData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAQIData = useCallback(async (lat: number, lon: number, cityLabel: string) => {
    try {
      const components = await getAirPollution(lat, lon);
      const epaResult = calculateEPAAQI(components);

      // Fetch History (3 days back)
      const now = Math.floor(Date.now() / 1000);
      const threeDaysAgo = now - (3 * 24 * 60 * 60);
      const historyItems = await getAirPollutionHistory(lat, lon, threeDaysAgo, now);

      // Fetch Forecast
      const forecastItems = await getAirPollutionForecast(lat, lon);

      // Process history (take 1 point per day)
      const processDaily = (items: any[]) => {
        const daily: Record<string, any> = {};
        items.forEach(item => {
          const date = new Date(item.dt * 1000).toDateString();
          if (!daily[date]) daily[date] = item;
        });
        return Object.values(daily);
      };

      const pastData = processDaily(historyItems).slice(-3).map(item => ({
        day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        avg: calculateEPAAQI(item.components).aqi,
        max: calculateEPAAQI(item.components).aqi,
        min: calculateEPAAQI(item.components).aqi,
      }));

      const futureData = processDaily(forecastItems).slice(1, 4).map(item => ({
        day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        avg: calculateEPAAQI(item.components).aqi,
        max: calculateEPAAQI(item.components).aqi,
        min: calculateEPAAQI(item.components).aqi,
      }));

      const todayData: DailyForecast = {
        day: "Today",
        avg: epaResult.aqi,
        max: epaResult.aqi,
        min: epaResult.aqi,
      };

      const fullForecast = [...pastData, todayData, ...futureData];

      const pollutants: Record<string, Pollutant> = {};
      const metricMap: Record<string, string> = {
        'pm2_5': 'Particulate Matter (PM2.5)',
        'pm10': 'Particulate Matter (PM10)',
        'no2': 'Nitrogen Dioxide (NO₂)',
        'so2': 'Sulfur Dioxide (SO₂)',
        'co': 'Carbon Monoxide (CO)',
        'o3': 'Ozone (O₃)',
      };

      Object.entries(epaResult.components).forEach(([key, val]) => {
        const name = metricMap[key] || key.toUpperCase();
        let severity: Pollutant['severity'] = undefined;
        if (val.aqi <= 50) severity = 'good';
        else if (val.aqi <= 100) severity = 'moderate';
        else severity = 'unhealthy';

        pollutants[key] = {
          value: Math.round(val.value * 100) / 100,
          name,
          unit: (key === 'co' || key === 'o3') ? 'ppm' : (key === 'no2' || key === 'so2' ? 'ppb' : 'µg/m³'),
          severity
        };
      });

      const newData: AQIData = {
        aqi: epaResult.aqi,
        category: getCategory(epaResult.aqi),
        city: cityLabel,
        cigaretteEquivalent: calculateCigaretteEquivalent(components.pm2_5),
        pollutants,
        forecast: fullForecast
      };

      setData(newData);

      if (epaResult.aqi > 100) {
        toast.warning(`AQI ${epaResult.aqi} - ${getCategory(epaResult.aqi)}`, {
          description: "Air quality is above safe levels!",
        });
      }
    } catch (error) {
      console.error("Error fetching AQI data:", error);
      throw error;
    }
  }, []);

  const fetchAQIByCity = useCallback(async (cityName: string, coords?: { lat: number; lng: number }) => {
    setIsLoading(true);
    try {
      let lat = coords?.lat;
      let lon = coords?.lng;
      let label = cityName;

      if (!lat || !lon) {
        const locations = await searchCities(cityName);
        if (locations.length === 0) throw new Error("City not found");
        lat = locations[0].lat;
        lon = locations[0].lon;
        label = locations[0].name;
      }

      await fetchAQIData(lat, lon, label);
    } catch (error) {
      toast.error("Lookup failed", { description: "City not found" });
      // Fallback to default city logic could go here
    } finally {
      setIsLoading(false);
    }
  }, [fetchAQIData]);

  const fetchAQIByLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      toast.info("Detecting your location...");

      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          throw new Error("Location permission denied");
        }
      }

      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const cityName = await reverseGeocode(latitude, longitude);
      await fetchAQIData(latitude, longitude, cityName);
      toast.success(`Location detected: ${cityName}`);
    } catch (error: any) {
      console.error("Location error:", error);
      toast.error(error.message || "Unable to detect location");
    } finally {
      setIsLoading(false);
    }
  }, [fetchAQIData]);

  return { data, isLoading, fetchAQIByCity, fetchAQIByLocation };
};
