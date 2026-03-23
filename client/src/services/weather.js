// Weather Alert API service - TripleGain Backend
import { getApiUrl } from "../config/api";

const WEATHER_CODE_LABELS = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers",
    81: "Moderate showers",
    82: "Violent showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail",
};

const extractNumericValue = (value) => {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return value;

    const match = value.match(/-?\d+(\.\d+)?/);
    if (!match) return value;

    const parsed = Number.parseFloat(match[0]);
    return Number.isNaN(parsed) ? value : parsed;
};

const resolveWeatherCondition = (value) => {
    if (typeof value === "number") {
        return WEATHER_CODE_LABELS[value] || `Weather code ${value}`;
    }

    if (typeof value === "string" && /^\d+$/.test(value.trim())) {
        const code = Number.parseInt(value, 10);
        return WEATHER_CODE_LABELS[code] || `Weather code ${code}`;
    }

    return value || "Unknown";
};

export const getWeatherAlert = async (latitude, longitude, cropType = "") => {
    try {
        const response = await fetch(getApiUrl("/weather/alert"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                latitude,
                longitude,
                cropType,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch weather alerts");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Weather API Error:", error);
        throw error;
    }
};

// Parse weather alert data for display
export const parseWeatherAlert = (data) => {
    if (!data) return null;

    return {
        location: `${data.location.latitude}, ${data.location.longitude}`,
        timezone: data.location.timezone,
        currentTemp: extractNumericValue(data.currentWeather.temperature),
        condition: resolveWeatherCondition(data.currentWeather.condition),
        humidity: extractNumericValue(data.currentWeather.humidity),
        windSpeed: extractNumericValue(data.currentWeather.windSpeed),
        alerts: data.alerts,
        forecast: {
            dates: data.sevenDayForecast.dates,
            maxTemps: data.sevenDayForecast.maxTemps,
            minTemps: data.sevenDayForecast.minTemps,
            precipitation: data.sevenDayForecast.precipitation,
        },
    };
};

// Get location list from weather API
export const getWeatherLocations = async () => {
    try {
        // Default farming regions
        return [
            { name: "Delhi", lat: 28.6139, lon: 77.209 },
            { name: "Punjab", lat: 31.5204, lon: 74.3587 },
            { name: "Haryana", lat: 29.0588, lon: 77.6249 },
            { name: "Uttar Pradesh", lat: 26.8467, lon: 80.9462 },
            { name: "Maharashtra", lat: 19.7515, lon: 75.7139 },
        ];
    } catch (error) {
        console.error("Error fetching locations:", error);
        return [];
    }
};
