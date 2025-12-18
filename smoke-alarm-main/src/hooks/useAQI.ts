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
      // Check if we're in a secure context (HTTPS or localhost)
      const isSecureContext = window.isSecureContext;
      const isLocalhost = window.location.hostname === "localhost" || 
                         window.location.hostname === "127.0.0.1" || 
                         window.location.hostname === "[::1]";
      
      if (!isSecureContext && !isLocalhost) {
        throw new Error("Geolocation requires HTTPS or localhost for security reasons");
      }

      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 15000, // Increased timeout
          enableHighAccuracy: true, // Enable high accuracy for better results
          maximumAge: 300000, // Accept cached positions up to 5 minutes old
        });
      });

      const { latitude, longitude } = position.coords;
      const { aqi } = await fetchOpenMeteoAQI(latitude, longitude);

      handleAQISuccess(aqi, `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`);

      toast.success("Location detected!", {
        description: `Showing AQI for your area`,
      });
    } catch (error: any) {
      console.error("Geolocation error:", error);
      
      let message = "Location access failed";
      let description = "You can manually enter a city name instead";
      
      // Handle specific error cases
      if (error.code === error.PERMISSION_DENIED) {
        message = "Location access denied";
        description = "Please enable location permissions for this site";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = "Location unavailable";
        description = "Location services may be disabled or unavailable";
      } else if (error.code === error.TIMEOUT) {
        message = "Location request timed out";
        description = "Please try again or enter a city manually";
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      toast.error(message, { description });
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
