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
        <div className="min-h-screen bg-[#F8FAFC] px-6 pb-20 pt-28">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                            <Clock3 size={14} />
                            Saved History
                        </div>
                        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                            Scan <span className="text-emerald-600">History</span>
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-500 md:text-base">
                            Review your earlier crop checks, compare results over time, and reopen treatment guidance whenever needed.
                        </p>
                    </div>

                    <Link
                        to="/disease-detection"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                    >
                        <ArrowLeft size={18} />
                        Back to Disease Detection 
                    </Link>
                </div>

                {historyError && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {historyError}
                    </div>
                )}

                <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-600">Overview</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-900">Your saved scan summary</h2>
                            <p className="mt-3 text-sm leading-relaxed text-slate-500">
                                Everything from disease alerts to the latest saved result stays organized here in one place.
                            </p>
                        </div>

                        <Link
                            to="/disease-detection"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                        >
                            Scan New Image
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <div className="rounded-[2rem] bg-slate-50 p-6">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Total Scans</p>
                            <p className="mt-3 text-4xl font-black text-slate-900">{totalScans}</p>
                            <p className="mt-3 text-sm text-slate-500">All saved detections linked to your account.</p>
                        </div>

                        <div className="rounded-[2rem] bg-rose-50 p-6">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-500">Disease Alerts</p>
                            <p className="mt-3 text-4xl font-black text-slate-900">{diseaseAlerts}</p>
                            <p className="mt-3 text-sm text-slate-500">Scans that were flagged as needing attention.</p>
                        </div>

                        <div className="rounded-[2rem] bg-emerald-50 p-6">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">Healthy Scans</p>
                            <p className="mt-3 text-4xl font-black text-slate-900">{healthyScans}</p>
                            <p className="mt-3 text-sm text-slate-500">Useful baseline scans you can compare later.</p>
                        </div>

                        <div className="rounded-[2rem] bg-sky-50 p-6">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">Most Frequent</p>
                            <p className="mt-3 text-2xl font-black text-slate-900">{mostFrequentCondition}</p>
                            <p className="mt-3 text-sm text-slate-500">
                                {latestScan ? `Latest: ${formatScanDate(latestScan.scannedAt)}` : 'No scans recorded yet.'}
                            </p>
                        </div>
                    </div>
                </div>

                {historyLoading ? (
                    <div className="mt-10 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40">
                        <div className="flex items-center gap-3 text-slate-500">
                            <Loader2 size={20} className="animate-spin text-emerald-600" />
                            <p className="font-semibold">Loading your scan history...</p>
                        </div>
                    </div>
                ) : scanHistory.length === 0 ? (
                    <div className="mt-10 rounded-[2rem] border border-dashed border-emerald-200 bg-white p-10 text-center shadow-xl shadow-slate-200/40">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                            <Leaf size={28} className="text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">No scan history yet</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
                            Start by analyzing a crop image. Each successful scan will be saved here so you can revisit the result and treatment guide later.
                        </p>
                        <Link
                            to="/disease-detection"
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-black text-white transition hover:bg-emerald-700"
                        >
                            Scan a Crop Now
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="mt-10 space-y-6">
                        {scanHistory.map((scan) => {
                            const treatmentGuide = getTreatmentGuide(scan);
                            const isExpanded = expandedScanId === scan.id;

                            return (
                                <div key={scan.id} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40">
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
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                                        >
                                            {isExpanded ? 'Hide Details' : 'Show Details'}
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
                                        <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div className="max-w-3xl">
                                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Treatment Guide</p>
                                                    <h3 className="mt-2 text-xl font-black text-slate-900">{treatmentGuide.title}</h3>
                                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{treatmentGuide.summary}</p>
                                                </div>
                                                <span className={`inline-flex items-center rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-wide ${getUrgencyStyles(treatmentGuide.urgency)}`}>
                                                    {treatmentGuide.urgency} Priority
                                                </span>
                                            </div>

                                            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                                    <div className="flex items-center gap-2 text-emerald-700">
                                                        <AlertCircle size={18} />
                                                        <p className="text-sm font-black uppercase tracking-[0.18em]">Immediate Actions</p>
                                                    </div>
                                                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                                                        {treatmentGuide.immediateActions.map((step) => (
                                                            <li key={step}>{step}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
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

                                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                                    <div className="flex items-center gap-2 text-emerald-700">
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
