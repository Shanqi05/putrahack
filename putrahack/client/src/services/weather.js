// Weather API service for Malaysia weather forecasts

const WEATHER_API = 'https://api.data.gov.my/weather/forecast';

export const getWeatherForecast = async (limit = 3) => {
    try {
        const response = await fetch(`${WEATHER_API}?limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Weather API Error:', error);
        throw error;
    }
};

// Parse weather data and return formatted results
export const parseWeatherData = (data) => {
    if (!data || !data.data) {
        return [];
    }

    return data.data.map((item) => ({
        location: item.location || 'Unknown',
        forecast: item.forecast || [],
        metadata: item.metadata || {},
    }));
};

// Get location list from weather API
export const getWeatherLocations = async () => {
    try {
        const data = await getWeatherForecast(1);
        const locations = data.data ? data.data.map(item => item.location) : [];
        return locations;
    } catch (error) {
        console.error('Error fetching locations:', error);
        return ['Kuala Lumpur']; // Default fallback
    }
};
