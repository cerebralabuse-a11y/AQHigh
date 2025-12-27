import { useState, useCallback } from "react";
import { toast } from "sonner";

// TODO: Get a free API token from https://aqicn.org/data-platform/token/
export const WAQI_TOKEN = "665a004fc8df48d5c4934eb859b00f2a12385e86";

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
  forecast: DailyForecast[];
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

// Conversions from AQI to Concentration using EPA Breakpoints
const interpolate = (aqi: number, breakpoints: { iLow: number, iHigh: number, cLow: number, cHigh: number }[]) => {
  for (const bp of breakpoints) {
    if (aqi >= bp.iLow && aqi <= bp.iHigh) {
      return ((aqi - bp.iLow) / (bp.iHigh - bp.iLow)) * (bp.cHigh - bp.cLow) + bp.cLow;
    }
  }
  // Fallback for out of bounds (extrapolate from last)
  const last = breakpoints[breakpoints.length - 1];
  if (aqi > last.iHigh) {
    return ((aqi - last.iLow) / (last.iHigh - last.iLow)) * (last.cHigh - last.cLow) + last.cLow;
  }
  return 0; // Should not happen for valid AQI
};

const aqiToPM25 = (aqi: number) => {
  const bps = [
    { iLow: 0, iHigh: 50, cLow: 0.0, cHigh: 12.0 },
    { iLow: 51, iHigh: 100, cLow: 12.1, cHigh: 35.4 },
    { iLow: 101, iHigh: 150, cLow: 35.5, cHigh: 55.4 },
    { iLow: 151, iHigh: 200, cLow: 55.5, cHigh: 150.4 },
    { iLow: 201, iHigh: 300, cLow: 150.5, cHigh: 250.4 },
    { iLow: 301, iHigh: 400, cLow: 250.5, cHigh: 350.4 }, // 400 is arbitrary cap for EPA calc but used here
    { iLow: 401, iHigh: 500, cLow: 350.5, cHigh: 500.4 },
  ];
  return interpolate(aqi, bps);
};

// Research: 22 µg/m³ of PM2.5 ≈ 1 cigarette
const calculateCigaretteEquivalent = (aqi: number): number => {
  const pm25 = aqiToPM25(aqi);
  return pm25 / 22;
};

// Helper for other conversions
const convertPollutant = (key: string, aqiVal: number): { value: number, unit: string } => {
  let val = aqiVal;
  let unit = "AQI"; // Fallback

  const keyLower = key.toLowerCase();

  if (keyLower === 'pm25') {
    val = aqiToPM25(aqiVal);
    unit = "µg/m³";
  } else if (keyLower === 'pm10') {
    const bps = [
      { iLow: 0, iHigh: 50, cLow: 0, cHigh: 54 },
      { iLow: 51, iHigh: 100, cLow: 55, cHigh: 154 },
      { iLow: 101, iHigh: 150, cLow: 155, cHigh: 254 },
      { iLow: 151, iHigh: 200, cLow: 255, cHigh: 354 },
      { iLow: 201, iHigh: 300, cLow: 355, cHigh: 424 },
      { iLow: 301, iHigh: 400, cLow: 425, cHigh: 504 },
      { iLow: 401, iHigh: 500, cLow: 505, cHigh: 604 }
    ];
    val = interpolate(aqiVal, bps);
    unit = "µg/m³";
  } else if (keyLower === 'o3') { // Ozone (8-hour)
    const bps = [
      { iLow: 0, iHigh: 50, cLow: 0, cHigh: 54 }, // ppb
      { iLow: 51, iHigh: 100, cLow: 55, cHigh: 70 },
      { iLow: 101, iHigh: 150, cLow: 71, cHigh: 85 },
      { iLow: 151, iHigh: 200, cLow: 86, cHigh: 105 },
      { iLow: 201, iHigh: 300, cLow: 106, cHigh: 200 }
    ];
    val = interpolate(aqiVal, bps);
    unit = "ppb";
  } else if (keyLower === 'no2') { // Nitrogen Dioxide (1-hour)
    const bps = [
      { iLow: 0, iHigh: 50, cLow: 0, cHigh: 53 },
      { iLow: 51, iHigh: 100, cLow: 54, cHigh: 100 },
      { iLow: 101, iHigh: 150, cLow: 101, cHigh: 360 },
      { iLow: 151, iHigh: 200, cLow: 361, cHigh: 649 },
      { iLow: 201, iHigh: 300, cLow: 650, cHigh: 1249 }
    ];
    val = interpolate(aqiVal, bps);
    unit = "ppb";
  } else if (keyLower === 'so2') { // Sulfur Dioxide (1-hour)
    const bps = [
      { iLow: 0, iHigh: 50, cLow: 0, cHigh: 35 },
      { iLow: 51, iHigh: 100, cLow: 36, cHigh: 75 },
      { iLow: 101, iHigh: 150, cLow: 76, cHigh: 185 },
      { iLow: 151, iHigh: 200, cLow: 186, cHigh: 304 }
    ];
    val = interpolate(aqiVal, bps);
    unit = "ppb";
  } else if (keyLower === 'co') { // Carbon Monoxide (8-hour)
    // Usually ppm
    const bps = [
      { iLow: 0, iHigh: 50, cLow: 0.0, cHigh: 4.4 },
      { iLow: 51, iHigh: 100, cLow: 4.5, cHigh: 9.4 },
      { iLow: 101, iHigh: 150, cLow: 9.5, cHigh: 12.4 },
      { iLow: 151, iHigh: 200, cLow: 12.5, cHigh: 15.4 },
      { iLow: 201, iHigh: 300, cLow: 15.5, cHigh: 30.4 }
    ];
    val = interpolate(aqiVal, bps) * 1000;
    unit = "ppb";
  }

  // Round to integer for cleaner display
  return { value: Math.round(val), unit };
};

const DEFAULT_CITY = "Delhi";

const fetchWAQIAQI = async (query: string, isLatLong = false) => {
  const searchParam = isLatLong ? `geo:${query}` : query;
  const url = `https://api.waqi.info/feed/${searchParam}/?token=${WAQI_TOKEN}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const data = await response.json();
    if (data.status !== "ok") throw new Error(data.data || "Unknown API error");

    const result = data.data;
    const aqi = result.aqi;
    const city = result.city?.name || (isLatLong ? "Current Location" : query);

    // Extract & Convert
    const pollutants: Record<string, Pollutant> = {};
    if (result.iaqi) {
      const metricMap: Record<string, string> = {
        'pm25': 'Particulate Matter (PM2.5)',
        'pm10': 'Particulate Matter (PM10)',
        'no2': 'Nitrogen Dioxide (NO₂)',
        'so2': 'Sulfur Dioxide (SO₂)',
        'co': 'Carbon Monoxide (CO)',
        'o3': 'Ozone (O₃)',
        't': 'Temperature',
        'h': 'Humidity',
        'w': 'Wind',
        'p': 'Pressure',
        'wg': 'Wind Gust'
      };

      Object.entries(result.iaqi).forEach(([key, val]: [string, any]) => {
        if (val && typeof val.v === 'number') {
          if (key === 'wd' || key === 'iso') return;

          const name = metricMap[key] || key.toUpperCase();
          const aqiValue = val.v;
          let value = aqiValue;
          let unit = "";
          let severity: Pollutant['severity'] = undefined;

          // Handle Weather vs Pollutants
          if (['t', 'h', 'w', 'p', 'wg'].includes(key)) {
            value = Math.round(aqiValue);
            if (key === 't') unit = '°C';
            if (key === 'h') unit = '%';
            if (key === 'p') unit = 'hPa';
            if (key === 'w' || key === 'wg') unit = 'm/s';
          } else {
            // For Pollutants, convert IAQI to Concentration
            const converted = convertPollutant(key, aqiValue);
            value = converted.value;
            unit = converted.unit;

            // Severity based on AQI standards (using original AQI value)
            if (aqiValue <= 50) severity = 'good';
            else if (aqiValue <= 100) severity = 'moderate';
            else severity = 'unhealthy';
          }

          pollutants[key] = { value, name, unit, severity };
        }
      });
    }



    // Extract Forecast (PM2.5 usually correlates best with general AQI)
    const forecast: DailyForecast[] = [];
    if (result.forecast && result.forecast.daily && result.forecast.daily.pm25) {
      result.forecast.daily.pm25.forEach((item: any) => {
        forecast.push({
          day: item.day,
          avg: item.avg,
          max: item.max,
          min: item.min
        });
      });
    }

    return { aqi, city, pollutants, forecast };
  } catch (error) {
    console.error("Error fetching AQI:", error);
    throw error;
  }
};

export const useAQI = () => {
  const [data, setData] = useState<AQIData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAQISuccess = useCallback((aqi: number, cityLabel: string, pollutants: Record<string, Pollutant> = {}, forecast: DailyForecast[] = []) => {
    if (typeof aqi !== 'number' || isNaN(aqi)) return;

    // Recalculate cigs using the new accurate PM2.5 derivation
    const newData: AQIData = {
      aqi,
      category: getCategory(aqi),
      city: cityLabel,
      cigaretteEquivalent: calculateCigaretteEquivalent(aqi),
      pollutants,
      forecast: forecast || []
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
      const { aqi, city, pollutants, forecast } = await fetchWAQIAQI(DEFAULT_CITY);
      handleAQISuccess(aqi, city, pollutants, forecast);
      toast.info(`Showing ${DEFAULT_CITY}`, { description: "Default city due to lookup issue" });
    } catch (err) {
      console.error("Error fetching default city:", err);
      setData(null);
      toast.error("Unable to load data", { description: "Check connection/API" });
    } finally {
      setIsLoading(false);
    }
  }, [handleAQISuccess]);

  const fetchAQIByCity = useCallback(async (cityName: string) => {
    setIsLoading(true);
    try {
      const { aqi, city, pollutants, forecast } = await fetchWAQIAQI(cityName);
      handleAQISuccess(aqi, city, pollutants, forecast);
    } catch (error) {
      toast.error("Lookup failed", { description: "City not found" });
      await fetchDefaultCity();
    } finally {
      setIsLoading(false);
    }
  }, [fetchDefaultCity, handleAQISuccess]);

  const fetchAQIByLocation = useCallback(async () => {
    setIsLoading(true);

    // Helper to wrap geolocation in a promise
    const getPosition = (options?: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by this browser."));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    try {
      const isSecureContext = window.isSecureContext;
      const isLocalhost = window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "[::1]";

      // Geolocation requires HTTPS (except on localhost)
      if (!isSecureContext && !isLocalhost) {
        throw new Error("Geolocation requires a secure connection (HTTPS).");
      }

      let position: GeolocationPosition;
      try {
        // Attempt 1: High Accuracy (Short timeout to fail fast)
        position = await getPosition({ timeout: 5000, enableHighAccuracy: true });
      } catch (err: any) {
        console.warn("High accuracy location failed:", err.message);

        // precise permission handling
        if (err.code === 1) { // PERMISSION_DENIED
          throw new Error("Permission denied. Please enable location services.");
        }

        // Attempt 2: Low Accuracy Fallback (Longer timeout)
        position = await getPosition({ timeout: 10000, enableHighAccuracy: false });
      }

      const { latitude, longitude } = position.coords;
      // Rounding coordinates slightly can improve API cache hit rate
      const lat = latitude.toFixed(4);
      const lng = longitude.toFixed(4);

      const { aqi, city, pollutants, forecast } = await fetchWAQIAQI(`${lat};${lng}`, true);

      handleAQISuccess(aqi, city, pollutants, forecast);
      toast.success(`Locality: ${city}`);
    } catch (error: any) {
      console.error("Location error details:", error);

      let errorMsg = "Unable to detect location";
      let desc = "Falling back to default city...";

      if (error.code === 1 || error.message?.includes("Permission")) {
        errorMsg = "Location Permission Denied";
        desc = "Please enable location access in your browser settings.";
      } else if (error.code === 2) {
        errorMsg = "Position Unavailable";
        desc = "GPS signal lost or unavailable.";
      } else if (error.code === 3) {
        errorMsg = "Location Timeout";
        desc = "Request took too long.";
      } else if (error.message?.includes("HTTPS")) {
        errorMsg = "Connection Insecure";
        desc = "Location requires HTTPS.";
      }

      toast.error(errorMsg, { description: desc });
      await fetchDefaultCity();
    } finally {
      setIsLoading(false);
    }
  }, [fetchDefaultCity, handleAQISuccess]);

  return { data, isLoading, fetchAQIByCity, fetchAQIByLocation };
};
