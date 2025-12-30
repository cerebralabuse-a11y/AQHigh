import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getAirPollution,
  calculateEPAAQI,
  searchCities,
  reverseGeocode,
  PollutionComponents
} from "@/services/openWeatherService";

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
        forecast: [] // Forecast migration omitted for brevity unless requested
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
      const getPosition = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      };

      toast.info("Detecting your location...");
      const position = await getPosition();
      const { latitude, longitude } = position.coords;

      const cityName = await reverseGeocode(latitude, longitude);
      await fetchAQIData(latitude, longitude, cityName);
      toast.success(`Location detected: ${cityName}`);
    } catch (error) {
      console.error("Location error:", error);
      toast.error("Unable to detect location");
    } finally {
      setIsLoading(false);
    }
  }, [fetchAQIData]);

  return { data, isLoading, fetchAQIByCity, fetchAQIByLocation };
};
