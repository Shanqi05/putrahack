// Weather Alert API service - TripleGain Backend
import { getApiUrl } from "../config/api";

const WEATHER_CACHE_PREFIX = "triplegain-weather";
const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;
const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

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

const formatCoordinate = (value) => {
    const parsedValue = Number.parseFloat(value);
    return Number.isFinite(parsedValue) ? parsedValue.toFixed(4) : String(value);
};

const createWeatherCacheKey = (latitude, longitude, cropType = "") =>
    `${WEATHER_CACHE_PREFIX}:${formatCoordinate(latitude)}:${formatCoordinate(longitude)}:${cropType.trim().toLowerCase() || "general"}`;

const getStorage = () => {
    if (typeof window === "undefined") return null;

    try {
        return window.localStorage;
    } catch (error) {
        console.warn("Weather cache unavailable:", error);
        return null;
    }
};

const readCachedWeather = (cacheKey, { allowStale = false } = {}) => {
    const storage = getStorage();
    if (!storage) return null;

    try {
        const rawValue = storage.getItem(cacheKey);
        if (!rawValue) return null;

        const parsedValue = JSON.parse(rawValue);
        if (!parsedValue?.data) return null;

        const isExpired = typeof parsedValue.expiresAt === "number" && Date.now() > parsedValue.expiresAt;
        if (isExpired && !allowStale) return null;

        return {
            data: parsedValue.data,
            isExpired,
        };
    } catch (error) {
        console.warn("Weather cache read failed:", error);
        return null;
    }
};

const writeCachedWeather = (cacheKey, data) => {
    const storage = getStorage();
    if (!storage) return;

    try {
        storage.setItem(
            cacheKey,
            JSON.stringify({
                data,
                expiresAt: Date.now() + WEATHER_CACHE_TTL_MS,
            })
        );
    } catch (error) {
        console.warn("Weather cache write failed:", error);
    }
};

const buildWeatherAlerts = (current, daily) => {
    const alerts = [];

    if ((current?.precipitation ?? 0) > 10) {
        alerts.push({
            level: "warning",
            message: `Heavy rainfall expected: ${current.precipitation}mm. Check crop drainage.`,
            icon: "Rain",
        });
    }

    if ((current?.wind_speed_10m ?? 0) > 40) {
        alerts.push({
            level: "warning",
            message: `High wind speed: ${current.wind_speed_10m} km/h. Secure crops and protect seedlings.`,
            icon: "Wind",
        });
    }

    if ((current?.temperature_2m ?? 0) > 38) {
        alerts.push({
            level: "caution",
            message: `Heat alert: ${current.temperature_2m}°C. Increase irrigation frequency.`,
            icon: "Heat",
        });
    }

    if ((current?.relative_humidity_2m ?? 100) < 30) {
        alerts.push({
            level: "caution",
            message: `Low humidity: ${current.relative_humidity_2m}%. Risk of pest infestation. Monitor crops closely.`,
            icon: "Humidity",
        });
    }

    if ((daily?.temperature_2m_min?.[0] ?? 1) < 0) {
        alerts.push({
            level: "danger",
            message: `Frost alert! Temperature may drop to ${daily.temperature_2m_min[0]}°C. Protect sensitive crops.`,
            icon: "Frost",
        });
    }

    return alerts;
};

const buildWeatherPayload = (weatherData, latitude, longitude, cropType = "", source = "backend") => {
    const current = weatherData?.current;
    const daily = weatherData?.daily;

    if (!current || !daily) {
        throw new Error("Incomplete weather data received");
    }

    return {
        status: "success",
        location: {
            latitude,
            longitude,
            timezone: weatherData.timezone || "auto",
        },
        currentWeather: {
            temperature: `${current.temperature_2m}°C`,
            condition: current.weather_code,
            humidity: `${current.relative_humidity_2m}%`,
            windSpeed: `${current.wind_speed_10m} km/h`,
            precipitation: `${current.precipitation}mm`,
        },
        sevenDayForecast: {
            dates: daily.time?.slice(0, 7) || [],
            maxTemps: daily.temperature_2m_max?.slice(0, 7) || [],
            minTemps: daily.temperature_2m_min?.slice(0, 7) || [],
            precipitation: daily.precipitation_sum?.slice(0, 7) || [],
        },
        alerts: buildWeatherAlerts(current, daily),
        timestamp: new Date().toISOString(),
        meta: {
            source,
            cropType,
        },
    };
};

const fetchBackendWeather = async (latitude, longitude, cropType = "") => {
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
        let errorMessage = `Weather backend request failed with status ${response.status}`;

        try {
            const errorPayload = await response.json();
            errorMessage = errorPayload?.message || errorPayload?.error || errorMessage;
        } catch (error) {
            console.warn("Unable to parse backend weather error payload:", error);
        }

        throw new Error(errorMessage);
    }

    return response.json();
};

const fetchOpenMeteoWeather = async (latitude, longitude, cropType = "") => {
    const query = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: "temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,precipitation",
        daily: "precipitation_sum,temperature_2m_max,temperature_2m_min,weather_code",
        forecast_days: "7",
        timezone: "auto",
    });

    const response = await fetch(`${OPEN_METEO_FORECAST_URL}?${query.toString()}`);
    if (!response.ok) {
        throw new Error(`Open-Meteo weather request failed with status ${response.status}`);
    }

    const data = await response.json();
    return buildWeatherPayload(data, latitude, longitude, cropType, "open-meteo");
};

export const getWeatherAlert = async (latitude, longitude, cropType = "") => {
    const cacheKey = createWeatherCacheKey(latitude, longitude, cropType);
    const cachedWeather = readCachedWeather(cacheKey);
    if (cachedWeather?.data) {
        return cachedWeather.data;
    }

    const staleCachedWeather = readCachedWeather(cacheKey, { allowStale: true });

    try {
        const backendData = await fetchBackendWeather(latitude, longitude, cropType);
        writeCachedWeather(cacheKey, backendData);
        return backendData;
    } catch (backendError) {
        console.warn("Weather backend unavailable, switching to direct Open-Meteo weather.", backendError);

        try {
            const fallbackData = await fetchOpenMeteoWeather(latitude, longitude, cropType);
            writeCachedWeather(cacheKey, fallbackData);
            return fallbackData;
        } catch (fallbackError) {
            if (staleCachedWeather?.data) {
                console.warn("Serving stale cached weather data after backend and fallback failures.", fallbackError);
                return {
                    ...staleCachedWeather.data,
                    meta: {
                        ...(staleCachedWeather.data.meta || {}),
                        servedFromCache: true,
                        stale: true,
                    },
                };
            }

            console.error("Weather API Error:", fallbackError);
            throw fallbackError;
        }
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
