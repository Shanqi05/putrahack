// Weather Alert API service - TripleGain Backend
const BACKEND_URL = 'http://localhost:5000';

export const getWeatherAlert = async (latitude, longitude, cropType = '') => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/weather/alert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude,
                longitude,
                cropType
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch weather alerts');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Weather API Error:', error);
        throw error;
    }
};

// Parse weather alert data for display
export const parseWeatherAlert = (data) => {
    if (!data) return null;

    return {
        location: `${data.location.latitude}, ${data.location.longitude}`,
        timezone: data.location.timezone,
        currentTemp: data.currentWeather.temperature,
        condition: data.currentWeather.condition,
        humidity: data.currentWeather.humidity,
        windSpeed: data.currentWeather.windSpeed,
        alerts: data.alerts,
        forecast: {
            dates: data.sevenDayForecast.dates,
            maxTemps: data.sevenDayForecast.maxTemps,
            minTemps: data.sevenDayForecast.minTemps,
            precipitation: data.sevenDayForecast.precipitation
        }
    };
};

// Get location list from weather API
export const getWeatherLocations = async () => {
    try {
        // Default farming regions
        return [
            { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
            { name: 'Punjab', lat: 31.5204, lon: 74.3587 },
            { name: 'Haryana', lat: 29.0588, lon: 77.6249 },
            { name: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
            { name: 'Maharashtra', lat: 19.7515, lon: 75.7139 }
        ];
    } catch (error) {
        console.error('Error fetching locations:', error);
        return [];
    }
};
