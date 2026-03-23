import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, ChevronDown, Clock3, Leaf, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToDiseaseScans } from '../services/diseaseHistory';
import { getTreatmentGuide } from '../services/diseaseTreatmentGuide';
import { formatScanDate, getActiveUserId, getUrgencyStyles } from '../utils/diseaseScanUi';

const getMostFrequentCondition = (history) => {
    const counts = history.reduce((accumulator, scan) => {
        if (!scan?.condition) return accumulator;
        accumulator[scan.condition] = (accumulator[scan.condition] || 0) + 1;
        return accumulator;
    }, {});

    const [condition = 'No scan data yet'] =
        Object.entries(counts).sort((first, second) => second[1] - first[1])[0] || [];

    return condition;
};

const DiseaseHistory = () => {
    const { user } = useAuth();
    const [scanHistory, setScanHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState('');
    const [expandedScanId, setExpandedScanId] = useState(null);
    const activeUserId = getActiveUserId(user);

    useEffect(() => {
        if (!activeUserId) {
            setScanHistory([]);
            setHistoryLoading(false);
            setHistoryError('');
            return;
        }

        setHistoryLoading(true);
        setHistoryError('');

        const unsubscribe = subscribeToDiseaseScans(
            activeUserId,
            (scans) => {
                setScanHistory(scans);
                setHistoryLoading(false);
            },
            (error) => {
                console.error('Fetch disease scan history error:', error);
                setHistoryError('We could not load your disease history right now.');
                setHistoryLoading(false);
            },
        );

        return () => unsubscribe();
    }, [activeUserId]);

    const totalScans = scanHistory.length;
    const healthyScans = scanHistory.filter((scan) => scan.isHealthy).length;
    const diseaseAlerts = totalScans - healthyScans;
    const latestScan = scanHistory[0] || null;
    const mostFrequentCondition = getMostFrequentCondition(scanHistory);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-orange-50 px-6 pb-20 pt-24">
            <div className="mx-auto max-w-6xl">
                <div className="relative mb-12 overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-orange-600 p-10 text-white shadow-2xl">
                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-300/15 blur-[110px]"></div>

                    <div className="relative z-10">
                        <Link
                            to="/disease-detection"
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white/90 transition hover:bg-white/15"
                        >
                            <ArrowLeft size={16} />
                            Back to Disease Detection
                        </Link>

                        <p className="mt-8 text-sm font-black uppercase tracking-[0.25em] text-orange-200">Historical Tracking</p>
                        <h1 className="mt-3 text-4xl font-black md:text-5xl">Your Crop Scan History</h1>
                        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-orange-50 md:text-base">
                            Review previous detections, compare confidence over time, and open the treatment guide for each saved scan whenever you need it.
                        </p>
                    </div>
                </div>

                {historyError && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {historyError}
                    </div>
                )}

                <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-lg">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Total Scans</p>
                        <p className="mt-3 text-4xl font-black text-slate-900">{totalScans}</p>
                        <p className="mt-3 text-sm text-slate-500">All saved detections linked to your account.</p>
                    </div>

                    <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-lg">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Disease Alerts</p>
                        <p className="mt-3 text-4xl font-black text-slate-900">{diseaseAlerts}</p>
                        <p className="mt-3 text-sm text-slate-500">Scans that were flagged as needing attention.</p>
                    </div>

                    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Healthy Scans</p>
                        <p className="mt-3 text-4xl font-black text-slate-900">{healthyScans}</p>
                        <p className="mt-3 text-sm text-slate-500">Good baseline scans you can compare against later.</p>
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Most Frequent Result</p>
                        <p className="mt-3 text-2xl font-black text-slate-900">{mostFrequentCondition}</p>
                        <p className="mt-3 text-sm text-slate-500">
                            {latestScan ? `Latest: ${formatScanDate(latestScan.scannedAt)}` : 'No scans recorded yet.'}
                        </p>
                    </div>
                </div>

                {historyLoading ? (
                    <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-lg">
                        <div className="flex items-center gap-3 text-slate-500">
                            <Loader2 size={20} className="animate-spin text-orange-500" />
                            <p className="font-semibold">Loading your scan history...</p>
                        </div>
                    </div>
                ) : scanHistory.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-orange-200 bg-white/80 p-10 text-center shadow-lg">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                            <Leaf size={28} className="text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">No scan history yet</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                            Start by analyzing a crop image. Each successful scan will be saved here so you can revisit the result and treatment guide later.
                        </p>
                        <Link
                            to="/disease-detection"
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-black text-white transition hover:bg-orange-600"
                        >
                            Scan a Crop Now
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {scanHistory.map((scan) => {
                            const treatmentGuide = getTreatmentGuide(scan);
                            const isExpanded = expandedScanId === scan.id;

                            return (
                                <div key={scan.id} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-lg">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-orange-700">
                                                    {scan.crop || 'Crop Scan'}
                                                </span>
                                                <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${scan.isHealthy ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                                    {scan.isHealthy ? 'Healthy' : 'Needs Attention'}
                                                </span>
                                                {treatmentGuide && (
                                                    <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${getUrgencyStyles(treatmentGuide.urgency)}`}>
                                                        {treatmentGuide.urgency} Priority
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="mt-4 text-2xl font-black text-slate-900">
                                                {scan.condition || scan.predictedLabel}
                                            </h2>
                                            <p className="mt-2 text-sm text-slate-500 break-all">{scan.fileName || 'Uploaded crop image'}</p>

                                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Scanned On</p>
                                                    <p className="mt-2 text-sm font-bold leading-relaxed text-slate-900">{formatScanDate(scan.scannedAt)}</p>
                                                </div>

                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Confidence</p>
                                                    <p className="mt-2 text-2xl font-black text-slate-900">
                                                        {typeof scan.confidence === 'number' ? `${(scan.confidence * 100).toFixed(1)}%` : 'N/A'}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Predicted Label</p>
                                                    <p className="mt-2 text-sm font-bold leading-relaxed text-slate-900">{scan.predictedLabel}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setExpandedScanId(isExpanded ? null : scan.id)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-black text-orange-700 transition hover:bg-orange-100"
                                        >
                                            {isExpanded ? 'Hide Treatment Guide' : 'View Treatment Guide'}
                                            <ChevronDown size={18} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>

                                    {!!scan.topPredictions?.length && (
                                        <div className="mt-5">
                                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Top Matches</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {scan.topPredictions.slice(0, 3).map((item) => (
                                                    <span
                                                        key={`${scan.id}-${item.label}`}
                                                        className="rounded-full border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700"
                                                    >
                                                        {item.condition} {(item.confidence * 100).toFixed(1)}%
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isExpanded && treatmentGuide && (
                                        <div className="mt-6 rounded-3xl border border-orange-100 bg-slate-50 p-5">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-500">Treatment Guide</p>
                                                    <h3 className="mt-2 text-xl font-black text-slate-900">{treatmentGuide.title}</h3>
                                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{treatmentGuide.summary}</p>
                                                </div>
                                                <span className={`inline-flex items-center rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-wide ${getUrgencyStyles(treatmentGuide.urgency)}`}>
                                                    {treatmentGuide.urgency} Priority
                                                </span>
                                            </div>

                                            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                                                <div className="rounded-2xl border border-orange-100 bg-white p-4">
                                                    <div className="flex items-center gap-2 text-orange-700">
                                                        <AlertCircle size={18} />
                                                        <p className="text-sm font-black uppercase tracking-[0.18em]">Immediate Actions</p>
                                                    </div>
                                                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                                                        {treatmentGuide.immediateActions.map((step) => (
                                                            <li key={step}>{step}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                                                    <div className="flex items-center gap-2 text-emerald-700">
                                                        <CheckCircle size={18} />
                                                        <p className="text-sm font-black uppercase tracking-[0.18em]">Prevention Tips</p>
                                                    </div>
                                                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                                                        {treatmentGuide.preventionTips.map((tip) => (
                                                            <li key={tip}>{tip}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="rounded-2xl border border-sky-100 bg-white p-4">
                                                    <div className="flex items-center gap-2 text-sky-700">
                                                        <ShieldCheck size={18} />
                                                        <p className="text-sm font-black uppercase tracking-[0.18em]">Monitor Next</p>
                                                    </div>
                                                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                                                        {treatmentGuide.monitorNext.map((check) => (
                                                            <li key={check}>{check}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-600">
                                                {treatmentGuide.disclaimer}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseHistory;
