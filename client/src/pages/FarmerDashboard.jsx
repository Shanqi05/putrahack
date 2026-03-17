import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Droplets, Thermometer, ChevronUp, ChevronDown, CheckCircle, AlertTriangle, Stethoscope, AlertOctagon } from 'lucide-react';
import { getWeatherAlert, parseWeatherAlert } from '../services/weather';
import { analyzeClimateAnomaly } from '../services/aiClimate';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import FarmTaskManager from '../components/dashboard/FarmTaskManager';

const REGION_COORDS = {
    'Kuala Lumpur': { lat: 3.1390, lon: 101.6869 },
    'Selangor': { lat: 3.0738, lon: 101.5183 },
    'Penang': { lat: 5.4141, lon: 100.3288 },
    'Johor': { lat: 1.4927, lon: 103.7414 },
    'Perak': { lat: 4.5921, lon: 101.0901 },
    'Pahang': { lat: 3.8126, lon: 103.3256 },
    'Terengganu': { lat: 5.3117, lon: 103.1324 },
    'Kelantan': { lat: 6.1211, lon: 102.2381 }
};

const FarmerDashboard = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);

    const [climateAlert, setClimateAlert] = useState(null);
    const [analyzingClimate, setAnalyzingClimate] = useState(false);

    const userRegion = user?.region || 'Penang';

    useEffect(() => {
        let hasAlerted = false;

        const fetchWeatherAndAnalyze = async () => {
            setWeatherLoading(true);
            setAnalyzingClimate(true);

            const coords = REGION_COORDS[userRegion] || REGION_COORDS['Penang'];

            try {
                const rawData = await getWeatherAlert(coords.lat, coords.lon);
                const parsedData = parseWeatherAlert(rawData);
                parsedData.locationName = userRegion;
                setWeatherData(parsedData);

                const aiAnalysis = await analyzeClimateAnomaly(coords.lat, coords.lon, userRegion);
                if (aiAnalysis && aiAnalysis.hasAnomaly) {
                    setClimateAlert(aiAnalysis);
                    if (!hasAlerted) {
                        addNotification("AI Climate Alert", aiAnalysis.warningTitle, "alert");
                        hasAlerted = true;
                    }
                }
            } catch (error) {
                console.warn("API Error:", error);
                setWeatherData({ locationName: userRegion, currentTemp: 33, condition: "Heavy Rain", humidity: 85, windSpeed: 18 });
            } finally {
                setWeatherLoading(false);
                setAnalyzingClimate(false);
            }
        };

        fetchWeatherAndAnalyze();
        // REMOVED addNotification from dependencies to fix infinite loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userRegion]);

    return (
        <div className="min-h-screen bg-emerald-50/30 pt-28 pb-10 px-6 md:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                <div>
                    <h1 className="text-3xl font-black text-emerald-950 tracking-tight">Dashboard Overview</h1>
                    <p className="text-emerald-700/70 font-medium mt-1">Welcome back, {user?.fullName || 'Farmer'}! Here is your farm status in {userRegion}.</p>
                </div>

                {analyzingClimate ? (
                    <div className="bg-emerald-100/50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-bold text-emerald-700">TripleGain AI is analyzing 5-year historical climate data...</span>
                    </div>
                ) : climateAlert ? (
                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg shadow-red-500/20 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                        <div className="bg-white/20 p-3 rounded-xl mt-1">
                            <AlertOctagon size={28} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-red-900/40 text-red-100 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md">AI Climate Alert</span>
                                <h3 className="font-black text-xl">{climateAlert.warningTitle}</h3>
                            </div>
                            <p className="text-red-50 font-medium mt-1 text-sm">{climateAlert.actionPlan}</p>
                        </div>
                    </div>
                ) : null}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                        <h2 className="text-2xl font-black mt-1">{weatherData?.locationName}</h2>
                                    </div>
                                    <CloudRain size={48} className="text-emerald-100 drop-shadow-md" />
                                </div>
                                <div className="mt-6 z-10">
                                    <div className="flex items-end gap-3">
                                        <span className="text-6xl font-black tracking-tighter">{weatherData?.currentTemp}°C</span>
                                        <span className="text-xl mb-1.5 font-bold text-emerald-100">{weatherData?.condition}</span>
                                    </div>
                                    <div className="flex space-x-4 mt-4 text-sm font-bold text-white bg-black/10 w-fit px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                                        <span className="flex items-center"><Droplets size={16} className="mr-1.5 text-blue-200" /> {weatherData?.humidity}% Humidity</span>
                                        <div className="w-px h-4 bg-white/20"></div>
                                        <span className="flex items-center"><Wind size={16} className="mr-1.5 text-gray-200" /> {weatherData?.windSpeed} km/h Wind</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-emerald-900/5 border border-emerald-50 flex flex-col min-h-[16rem]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-emerald-950">My Inventory</h2>
                            <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">View All</button>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                <div>
                                    <p className="font-bold text-emerald-950">Fresh Tomatoes</p>
                                    <p className="text-sm text-emerald-600/80 font-bold mt-0.5">150 kg</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-emerald-950">RM 4.50 <span className="text-xs font-bold text-emerald-600/60">/ kg</span></p>
                                    <p className="text-xs text-green-600 font-bold flex items-center justify-end mt-1 bg-green-100 px-2 py-0.5 rounded-md w-fit ml-auto">
                                        <ChevronUp size={14} className="mr-0.5" /> 12%
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-red-50/50 rounded-2xl border border-red-100">
                                <div>
                                    <p className="font-bold text-emerald-950">Organic Cabbage</p>
                                    <p className="text-sm text-emerald-600/80 font-bold mt-0.5">85 kg</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-emerald-950">RM 3.20 <span className="text-xs font-bold text-emerald-600/60">/ kg</span></p>
                                    <p className="text-xs text-red-600 font-bold flex items-center justify-end mt-1 bg-red-100 px-2 py-0.5 rounded-md w-fit ml-auto">
                                        <ChevronDown size={14} className="mr-0.5" /> 5%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-900/5 border border-emerald-50 h-full">
                        <div className="flex items-center gap-2 mb-4 text-emerald-950">
                            <Stethoscope size={20} className="text-emerald-500" />
                            <h3 className="font-black text-lg">Recent AI Scans</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600"><CheckCircle size={16} /></div>
                                <div>
                                    <p className="font-bold text-sm text-emerald-950">Tomato Leaves</p>
                                    <p className="text-xs text-emerald-600/70 font-medium">Healthy • 98% Accuracy</p>
                                </div>
                                <span className="text-xs font-bold text-gray-400 ml-auto">2h ago</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-900/5 border border-emerald-50 h-full">
                        <div className="flex items-center gap-2 mb-4 text-emerald-950">
                            <Thermometer size={20} className="text-orange-500" />
                            <h3 className="font-black text-lg">Market Demand</h3>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 mb-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-orange-900">High Demand: Chillies</span>
                                <span className="text-xs font-black text-white bg-orange-500 px-2 py-1 rounded-md">SELL NOW</span>
                            </div>
                            <p className="text-xs text-orange-700/80 font-medium mt-1">Buyers looking for chillies. Price up 15%.</p>
                        </div>
                    </div>

                    <FarmTaskManager />
                </div>
            </div>
        </div>
    );
};

export default FarmerDashboard;