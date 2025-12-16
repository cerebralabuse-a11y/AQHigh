import { useState, useCallback } from "react";
import { toast } from "sonner";

interface AQIData {
  aqi: number;
  category: string;
  city: string;
  cigaretteEquivalent: number;
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

// Research suggests 1 cigarette ≈ AQI 22 per day exposure
// Source: Berkeley Earth study
const calculateCigaretteEquivalent = (aqi: number): number => {
  return aqi / 22;
};

const DEFAULT_CITY = "Delhi";

const fetchOpenMeteoAQI = async (latitude: number, longitude: number) => {
  // Open-Meteo Air Quality API (free, no key). We grab the latest US AQI reading.
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=us_aqi&timezone=auto`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data); // Debug log
    
    const values: number[] | undefined = data?.hourly?.us_aqi;
    const timestamps: string[] | undefined = data?.hourly?.time;

    if (!values || !Array.isArray(values) || values.length === 0) {
      console.error("No AQI values in response:", data);
      throw new Error("No AQI data available in API response");
    }

    if (!timestamps || !Array.isArray(timestamps) || timestamps.length === 0) {
      console.error("No timestamps in response:", data);
      throw new Error("No timestamp data available");
    }

    // Filter out null/undefined values and take the latest valid value
    const validValues = values.filter((v): v is number => v != null && !isNaN(v));
    if (validValues.length === 0) {
      throw new Error("No valid AQI values found");
    }

    // Take the latest value (last entry)
    const aqi = validValues[validValues.length - 1];
    const time = timestamps[timestamps.length - 1];

    console.log("Extracted AQI:", aqi, "at time:", time); // Debug log

    return { aqi, time };
  } catch (error) {
    console.error("Error fetching AQI:", error);
    throw error;
  }
};

const geocodeCity = async (city: string) => {
  // Open-Meteo Geocoding API to turn a city name into coords
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to look up city");
  }

  const data = await response.json();
  const result = data?.results?.[0];
  if (!result) {
    throw new Error("City not found");
  }

  return {
    latitude: result.latitude as number,
    longitude: result.longitude as number,
    name: result.name as string,
    country: result.country as string,
  };
};

export const useAQI = () => {
  const [data, setData] = useState<AQIData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAQISuccess = useCallback((aqi: number, cityLabel: string) => {
    const newData: AQIData = {
      aqi,
      category: getCategory(aqi),
      city: cityLabel,
      cigaretteEquivalent: calculateCigaretteEquivalent(aqi),
    };

    setData(newData);

    if (aqi > 100) {
      toast.warning(`AQI ${aqi} - ${getCategory(aqi)}`, {
        description: "Air quality is above safe levels!",
      });
    }
  }, []);

  const fetchDefaultCity = useCallback(async () => {
    setIsLoading(true);
    try {
      const geo = await geocodeCity(DEFAULT_CITY);
      const { aqi } = await fetchOpenMeteoAQI(geo.latitude, geo.longitude);
      handleAQISuccess(aqi, `${geo.name}${geo.country ? `, ${geo.country}` : ""}`);
      toast.info(`Showing ${DEFAULT_CITY}`, {
        description: "Default city used due to lookup issue",
      });
    } catch (err) {
      console.error("Error fetching default city:", err);
      setData(null);
      toast.error("Unable to load fallback city", {
        description: "Please check your internet connection and try again",
      });
    } finally {
      setIsLoading(false);
    }
  }, [handleAQISuccess]);

  const fetchAQIByCity = useCallback(async (city: string) => {
    setIsLoading(true);
    
    try {
      const geo = await geocodeCity(city);
      const { aqi } = await fetchOpenMeteoAQI(geo.latitude, geo.longitude);

      const cityLabel = `${geo.name}${geo.country ? `, ${geo.country}` : ""}`;
      handleAQISuccess(aqi, cityLabel);
    } catch (error) {
      console.error("Error fetching AQI by city:", error);
      toast.error("Live AQI lookup failed", {
        description: "Check the city name or your network connection",
      });
      await fetchDefaultCity();
    } finally {
      setIsLoading(false);
    }
  }, [fetchDefaultCity, handleAQISuccess]);

  const fetchAQIByLocation = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const isSecure = typeof window !== "undefined" && (window.isSecureContext || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      if (!isSecure) {
        throw new Error("Geolocation requires HTTPS or localhost");
      }

      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false,
        });
      });

      const { latitude, longitude } = position.coords;
      const { aqi } = await fetchOpenMeteoAQI(latitude, longitude);

      handleAQISuccess(aqi, `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);

      toast.success("Location detected!", {
        description: `Showing AQI for your area`,
      });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Location access or AQI lookup failed";
      toast.error(message, {
        description: "If on HTTP, switch to localhost or HTTPS. You can also type a city.",
      });
      await fetchDefaultCity();
    } finally {
      setIsLoading(false);
    }
  }, [fetchDefaultCity, handleAQISuccess]);

  return {
    data,
    isLoading,
    fetchAQIByCity,
    fetchAQIByLocation,
  };
};
