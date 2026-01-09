export const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "18d25088a4cb9defc32de3bec9387bc3";

export interface GeoLocation {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
}

export interface PollutionComponents {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
}

export interface EPA_AQI_Result {
    aqi: number;
    mainPollutant: string;
    components: Record<string, { value: number; aqi: number }>;
}

// EPA AQI Breakpoints (Updated PM2.5 May 2024)
const BREAKPOINTS: Record<string, Breakpoint[]> = {
    pm2_5: [
        { cLow: 0.0, cHigh: 9.0, iLow: 0, iHigh: 50 },
        { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
        { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
        { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
        { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
        { cLow: 225.5, cHigh: 325.4, iLow: 301, iHigh: 400 },
        { cLow: 325.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
    ],
    pm10: [
        { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
        { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
        { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
        { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
        { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
        { cLow: 425, cHigh: 504, iLow: 301, iHigh: 400 },
        { cLow: 505, cHigh: 604, iLow: 401, iHigh: 500 },
    ],
    no2: [
        { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
        { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
        { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
        { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
        { cLow: 650, cHigh: 1249, iLow: 201, iHigh: 300 },
        { cLow: 1250, cHigh: 1649, iLow: 301, iHigh: 400 },
        { cLow: 1650, cHigh: 2049, iLow: 401, iHigh: 500 },
    ],
    so2: [
        { cLow: 0, cHigh: 35, iLow: 0, iHigh: 50 },
        { cLow: 36, cHigh: 75, iLow: 51, iHigh: 100 },
        { cLow: 76, cHigh: 185, iLow: 101, iHigh: 150 },
        { cLow: 186, cHigh: 304, iLow: 151, iHigh: 200 },
        { cLow: 305, cHigh: 604, iLow: 201, iHigh: 300 },
        { cLow: 605, cHigh: 804, iLow: 301, iHigh: 400 },
        { cLow: 805, cHigh: 1004, iLow: 401, iHigh: 500 },
    ],
    co: [
        { cLow: 0, cHigh: 4.4, iLow: 0, iHigh: 50 },
        { cLow: 4.5, cHigh: 9.4, iLow: 51, iHigh: 100 },
        { cLow: 9.5, cHigh: 12.4, iLow: 101, iHigh: 150 },
        { cLow: 12.5, cHigh: 15.4, iLow: 151, iHigh: 200 },
        { cLow: 15.5, cHigh: 30.4, iLow: 201, iHigh: 300 },
        { cLow: 30.5, cHigh: 40.4, iLow: 301, iHigh: 400 },
        { cLow: 40.5, cHigh: 50.4, iLow: 401, iHigh: 500 },
    ],
    o3: [ // 8-hour ozone
        { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
        { cLow: 55, cHigh: 70, iLow: 51, iHigh: 100 },
        { cLow: 71, cHigh: 85, iLow: 101, iHigh: 150 },
        { cLow: 86, cHigh: 105, iLow: 151, iHigh: 200 },
        { cLow: 106, cHigh: 200, iLow: 201, iHigh: 300 },
    ]
};

interface Breakpoint {
    cLow: number;
    cHigh: number;
    iLow: number;
    iHigh: number;
}

const interpolate = (conc: number, bp: Breakpoint) => {
    return Math.round(((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (conc - bp.cLow) + bp.iLow);
};

export const calculateEPAAQI = (components: PollutionComponents): EPA_AQI_Result => {
    const aqis: Record<string, { value: number; aqi: number }> = {};

    // OpenWeather CO is in µg/m³, EPA CO is in ppm.
    // ppm = (mg/m^3 * 24.45) / molecular_weight
    // CO molecular weight = 28.01
    // µg/m³ to mg/m³ divide by 1000
    const co_mg = components.co / 1000;
    const co_ppm = (co_mg * 24.45) / 28.01;

    // O3 µg/m³ to ppm. MW = 48.00
    const o3_ppm = (components.o3 * 24.45) / 48000;

    const pollutantData: Record<string, number> = {
        pm2_5: components.pm2_5,
        pm10: components.pm10,
        no2: components.no2, // EPA NO2 is in ppb. OW NO2 is in µg/m³. MW = 46.01. µg/m³ to ppb: (µg/m³ * 24.45) / 46.01
        so2: components.so2, // EPA SO2 is in ppb. OW SO2 is in µg/m³. MW = 64.07. µg/m³ to ppb: (µg/m³ * 24.45) / 64.07
        co: co_ppm,
        o3: o3_ppm
    };

    // Convert NO2 and SO2 to ppb for EPA formula
    pollutantData.no2 = (components.no2 * 24.45) / 46.01;
    pollutantData.so2 = (components.so2 * 24.45) / 64.07;

    Object.entries(pollutantData).forEach(([key, value]) => {
        const bps = BREAKPOINTS[key as keyof typeof BREAKPOINTS];
        if (!bps) return;

        const bp = bps.find(b => value >= b.cLow && value <= b.cHigh);
        if (bp) {
            aqis[key] = { value, aqi: interpolate(value, bp) };
        } else {
            // Fallback for extreme values
            const lastBp = bps[bps.length - 1];
            if (value > lastBp.cHigh) {
                aqis[key] = { value, aqi: lastBp.iHigh };
            } else {
                aqis[key] = { value, aqi: 0 };
            }
        }
    });

    const validAQIs = Object.values(aqis).map(a => a.aqi);
    const finalAQI = Math.max(...validAQIs, 0);
    const mainPollutant = Object.keys(aqis).find(k => aqis[k].aqi === finalAQI) || "N/A";

    return {
        aqi: finalAQI,
        mainPollutant,
        components: aqis
    };
};

export const searchCities = async (query: string): Promise<GeoLocation[]> => {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=10&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Geocoding failed");
    return response.json();
};

export const getAirPollution = async (lat: number, lon: number): Promise<PollutionComponents> => {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Pollution fetch failed");
    const data = await response.json();
    return data.list[0].components;
};

export const getAirPollutionHistory = async (lat: number, lon: number, start: number, end: number): Promise<any[]> => {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("History fetch failed");
    const data = await response.json();
    return data.list;
};

export const getAirPollutionForecast = async (lat: number, lon: number): Promise<any[]> => {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast fetch failed");
    const data = await response.json();
    return data.list;
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return "Current Location";
    const data = await response.json();
    if (data && data.length > 0) {
        return data[0].name;
    }
    return "Current Location";
};
