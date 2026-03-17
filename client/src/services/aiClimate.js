// Fetch 5-year historical average data (Open-Meteo Archive)
const fetchHistoricalAverage = async (lat, lon) => {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2019-03-01&end_date=2023-03-31&daily=temperature_2m_max,precipitation_sum&timezone=auto`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        const temps = data.daily.temperature_2m_max.filter((t) => t !== null);
        const rains = data.daily.precipitation_sum.filter((r) => r !== null);

        const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
        const avgRain = (rains.reduce((a, b) => a + b, 0) / 5).toFixed(1);

        return { avgTemp, avgRain };
    } catch (error) {
        console.error("Historical Data Error:", error);
        return { avgTemp: 32.5, avgRain: 150 }; // Fallback
    }
};

// Fetch current 7-day forecast (Open-Meteo Forecast)
const fetchCurrentForecast = async (lat, lon) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum&timezone=auto`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        const temps = data.daily.temperature_2m_max;
        const rains = data.daily.precipitation_sum;

        const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
        const totalRain = rains.reduce((a, b) => a + b, 0).toFixed(1);

        return { avgTemp, totalRain };
    } catch (error) {
        console.error("Forecast Data Error:", error);
        return { avgTemp: 35.0, totalRain: 20 }; // Fallback
    }
};

// Analyze climate data using Google Gemini API
export const analyzeClimateAnomaly = async (lat, lon, regionName) => {
    try {
        const [history, forecast] = await Promise.all([fetchHistoricalAverage(lat, lon), fetchCurrentForecast(lat, lon)]);

        const prompt = `
        You are an expert agricultural AI. Analyze the climate data for ${regionName}, Malaysia.
        
        Historical 5-year average for this month:
        - Average Max Temp: ${history.avgTemp}°C
        - Average Monthly Rainfall: ${history.avgRain}mm
        
        Current 7-day forecast (scaled to month):
        - Expected Max Temp: ${forecast.avgTemp}°C
        - Expected Rainfall: ${forecast.totalRain}mm
        
        Compare these. Is there a significant climate anomaly (e.g. extreme drought, heatwave, or flood risk)?
        Respond ONLY in raw JSON format with exactly these keys:
        {
          "hasAnomaly": boolean,
          "warningTitle": "Short 3-5 word alert title",
          "actionPlan": "One concise sentence giving specific advice to the farmer."
        }
        Do not output any markdown blocks like \`\`\`json. Just the pure JSON object.
    `;

        const API_KEY = "AIzaSyCmQuJxdxOhGH5gT2i1_fd05qy2b_eLwlA";

        if (!API_KEY) {
            throw new Error("VITE_GEMINI_API_KEY is missing in environment variables!");
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        const result = await response.json();

        if (result.error) {
            throw new Error(`Gemini API Error: ${result.error.message}`);
        }

        let aiText = result.candidates[0].content.parts[0].text;

        aiText = aiText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(aiText);
    } catch (error) {
        console.error("🚨 AI Analysis Failed Details:", error.message || error);

        return {
            hasAnomaly: true,
            warningTitle: "Heavy Rainfall Risk",
            actionPlan: "Unable to connect to AI. Please ensure drainage systems are clear based on local weather trends.",
        };
    }
};
