import React, { useState, useEffect } from "react";
import { CloudRain, Wind, Droplets, BarChart3, CheckCircle, AlertOctagon, Stethoscope, TrendingUp, TrendingDown, Loader } from "lucide-react";
import { getWeatherAlert, parseWeatherAlert } from "../services/weather";
import { analyzeClimateAnomaly } from "../services/aiClimate";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext.js";
import FarmTaskManager from "../components/dashboard/FarmTaskManager";
import InventoryManager from "../components/dashboard/InventoryManager";
import { getApiUrl } from "../config/api";

const REGION_COORDS = {
    "Kuala Lumpur": { lat: 3.139, lon: 101.6869 },
    Selangor: { lat: 3.0738, lon: 101.5183 },
    Penang: { lat: 5.4141, lon: 100.3288 },
    Johor: { lat: 1.4927, lon: 103.7414 },
    Perak: { lat: 4.5921, lon: 101.0901 },
    Pahang: { lat: 3.8126, lon: 103.3256 },
    Terengganu: { lat: 5.3117, lon: 103.1324 },
    Kelantan: { lat: 6.1211, lon: 102.2381 },
};

const FarmerDashboard = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();

    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);

    const [climateAlert, setClimateAlert] = useState(null);
    const [analyzingClimate, setAnalyzingClimate] = useState(false);

    const [marketDemand, setMarketDemand] = useState([]);
    const [loadingDemand, setLoadingDemand] = useState(true);

    const userRegion = user?.region || "Penang";

    useEffect(() => {
        const fetchWeatherAndAnalyze = async () => {
            setWeatherLoading(true);
            setAnalyzingClimate(true);
            const coords = REGION_COORDS[userRegion] || REGION_COORDS["Penang"];

            try {
                const rawData = await getWeatherAlert(coords.lat, coords.lon);
                const parsedData = parseWeatherAlert(rawData);
                parsedData.location = userRegion;
                setWeatherData(parsedData);

                const aiAnalysis = await analyzeClimateAnomaly(coords.lat, coords.lon, userRegion);

                if (aiAnalysis && aiAnalysis.hasAnomaly) {
                    setClimateAlert(aiAnalysis);

                    const todayStr = new Date().toDateString();
                    const lastAlertDate = localStorage.getItem('triplegain_last_climate_alert');

                    if (lastAlertDate !== todayStr) {
                        addNotification("AI Climate Alert", aiAnalysis.warningTitle, "alert");
                        localStorage.setItem('triplegain_last_climate_alert', todayStr);
                    }
                }
            } catch (error) {
                console.warn("Weather API Error:", error);
            } finally {
                setWeatherLoading(false);
                setAnalyzingClimate(false);
            }
        };

        // ... (保留你后面的 fetchMarketDemand 逻辑)

        const fetchMarketDemand = async () => {
            setLoadingDemand(true);
            try {
                const aiPrompt = `Analyze the agricultural market in ${userRegion}, Malaysia for today. 
                Return ONLY a raw JSON array of exactly 5 objects representing current crop demand (include major crops like Tomato, Cabbage, Chili, etc.). 
                Keys MUST be exactly: 
                - "crop" (string, name of the crop)
                - "trend" (string, strictly "up" or "down")
                - "price" (string, e.g. "RM 4.50/kg")
                - "demand" (string, strictly "High" or "Low"). 
                Do not include markdown formatting or backticks.`;

                const response = await fetch(getApiUrl('/chatbot/ask'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: aiPrompt })
                });

                if (response.ok) {
                    const data = await response.json();
                    let text = data.reply.replace(/```json/gi, '').replace(/```/g, '').trim();
                    const start = text.indexOf('[');
                    const end = text.lastIndexOf(']');
                    if (start !== -1 && end !== -1) {
                        text = text.substring(start, end + 1);
                    }
                    setMarketDemand(JSON.parse(text));
                } else {
                    throw new Error("Failed to fetch AI demand");
                }
            } catch (error) {
                console.error("Demand AI Error:", error);

                setMarketDemand([
                    { crop: "Red Chillies", trend: "up", price: "RM 14.50/kg", demand: "High" },
                    { crop: "Tomatoes", trend: "up", price: "RM 5.20/kg", demand: "High" },
                    { crop: "Cabbage", trend: "down", price: "RM 3.10/kg", demand: "Low" },
                    { crop: "Spinach", trend: "up", price: "RM 6.80/kg", demand: "High" },
                    { crop: "Cucumbers", trend: "down", price: "RM 4.00/kg", demand: "Low" }
                ]);
            } finally {
                setLoadingDemand(false);
            }
        };

        fetchWeatherAndAnalyze();
        fetchMarketDemand(); // 触发市场分析
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userRegion]);

    return (
        <div className="min-h-screen bg-emerald-50/30 pt-28 pb-10 px-6 md:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-black text-emerald-950 tracking-tight">Dashboard Overview</h1>
                    <p className="text-emerald-700/70 font-medium mt-1">
                        Welcome back, {user?.fullName || "Farmer"}! Here is your farm status in {userRegion}.
                    </p>
                </div>

                {/* AI Climate Alert Banner */}
                {analyzingClimate ? (
                    <div className="bg-emerald-100/50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-bold text-emerald-700">
                            TripleGain AI is analyzing 5-year historical climate data...
                        </span>
                    </div>
                ) : climateAlert ? (
                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg shadow-red-500/20 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                        <div className="bg-white/20 p-3 rounded-xl mt-1">
                            <AlertOctagon size={28} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-red-900/40 text-red-100 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md">
                                  AI Climate Alert
                                </span>
                                <h3 className="font-black text-xl">{climateAlert.warningTitle}</h3>
                            </div>
                            <p className="text-red-50 font-medium mt-1 text-sm">{climateAlert.actionPlan}</p>
                        </div>
                    </div>
                ) : null}

                {/* Grid 1: Weather & Real Inventory */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weather Card */}
                    <div className="bg-gradient-to-br from-[#065F46] to-[#10B981] rounded-3xl p-8 text-white shadow-xl shadow-emerald-900/10 flex flex-col justify-between min-h-[16rem] relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        {weatherLoading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <p className="font-medium text-emerald-100">Syncing live weather for {userRegion}...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start z-10">
                                    <div>
                                        <p className="text-emerald-100 font-bold tracking-wider text-sm uppercase">Live Weather Data</p>
                                        <h2 className="text-2xl font-black mt-1">{weatherData?.location || userRegion}</h2>
                                    </div>
                                    <CloudRain size={48} className="text-emerald-100 drop-shadow-md" />
                                </div>
                                <div className="mt-6 z-10">
                                    <div className="flex items-end gap-3">
                                        <span className="text-6xl font-black tracking-tighter">{weatherData?.currentTemp || 32}°C</span>
                                        <span className="text-xl mb-1.5 font-bold text-emerald-100">{weatherData?.condition || "Sunny"}</span>
                                    </div>
                                    <div className="flex space-x-4 mt-4 text-sm font-bold text-white bg-black/10 w-fit px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                                        <span className="flex items-center">
                                            <Droplets size={16} className="mr-1.5 text-blue-200" /> {weatherData?.humidity || 75}% Humidity
                                        </span>
                                        <div className="w-px h-4 bg-white/20"></div>
                                        <span className="flex items-center">
                                            <Wind size={16} className="mr-1.5 text-gray-200" /> {weatherData?.windSpeed || 12} km/h Wind
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="[&>div]:mt-0 [&>div]:h-full [&>div]:shadow-xl [&>div]:shadow-emerald-900/5 [&>div]:border-emerald-50 [&>div]:rounded-3xl">
                        <InventoryManager />
                    </div>
                </div>

                {/* Grid 2: Scans, Market Demand & Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent AI Scans */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-900/5 border border-emerald-50 h-full">
                        <div className="flex items-center gap-2 mb-4 text-emerald-950">
                            <Stethoscope size={20} className="text-emerald-500" />
                            <h3 className="font-black text-lg">Recent AI Scans</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <CheckCircle size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-emerald-950">Tomato Leaves</p>
                                    <p className="text-xs text-emerald-600/70 font-medium">Healthy • 98% Accuracy</p>
                                </div>
                                <span className="text-xs font-bold text-gray-400 ml-auto">2h ago</span>
                            </div>
                        </div>
                    </div>

                    {/* 🌟 动态生成的 Market Demand Highlights */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-900/5 border border-emerald-50 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4 text-emerald-950">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={20} className="text-orange-500" />
                                <h3 className="font-black text-lg">Market Demand</h3>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">Live AI</span>
                        </div>

                        {loadingDemand ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-2 opacity-50">
                                <Loader className="animate-spin text-orange-500" size={24} />
                                <span className="text-xs font-bold text-slate-500">Analyzing local market...</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {marketDemand.map((item, idx) => (
                                    <div key={idx} className={`p-4 rounded-2xl border ${item.trend === 'up' ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`font-bold ${item.trend === 'up' ? 'text-orange-900' : 'text-slate-700'}`}>
                                                {item.crop}
                                            </span>
                                            {item.trend === 'up' ? (
                                                <span className="text-xs font-black text-white bg-orange-500 px-2 py-1 rounded-md flex items-center gap-1">
                                                    <TrendingUp size={12} /> {item.demand}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-md flex items-center gap-1">
                                                    <TrendingDown size={12} /> {item.demand}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <p className={`text-xs font-medium ${item.trend === 'up' ? 'text-orange-700/80' : 'text-slate-500'}`}>
                                                Wholesale price
                                            </p>
                                            <p className="font-black text-emerald-700">{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-[400px] lg:h-auto">
                        <FarmTaskManager />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerDashboard;
