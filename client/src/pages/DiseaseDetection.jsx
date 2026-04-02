import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, CheckCircle, AlertCircle, Leaf, ArrowRight, Loader2, Clock3, Activity, ShieldCheck, ChevronDown } from 'lucide-react';
import { predictDisease } from '../services/diseaseDetection';
import { saveDiseaseScan, subscribeToDiseaseScans } from '../services/diseaseHistory';
import { getTreatmentGuide } from '../services/diseaseTreatmentGuide';
import { useAuth } from '../context/AuthContext';
import { formatScanDate, getActiveUserId, getUrgencyStyles } from '../utils/diseaseScanUi';

const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'];

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

const DiseaseDetection = () => {
    const { user } = useAuth();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [analysisError, setAnalysisError] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [showTreatmentGuideDetails, setShowTreatmentGuideDetails] = useState(false);
    const [scanHistory, setScanHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState('');
    const fileInputRef = useRef(null);
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
                setHistoryError('We could not load your previous scans right now.');
                setHistoryLoading(false);
            },
        );

        return () => unsubscribe();
    }, [activeUserId]);

    const isSupportedImageFile = (file) => {
        if (!file) return false;

        const lowerName = file.name.toLowerCase();
        const hasAllowedExtension = ACCEPTED_IMAGE_EXTENSIONS.some((extension) =>
            lowerName.endsWith(extension)
        );

        return file.type.startsWith('image/') && hasAllowedExtension;
    };

    const loadImageFile = (file) => {
        if (!file) return;

        if (!isSupportedImageFile(file)) {
            setUploadedFile(null);
            setUploadedImage(null);
            setPrediction(null);
            setShowTreatmentGuideDetails(false);
            setUploadError('Please upload an image file in .jpg, .jpeg, .png, .webp, or .bmp format.');
            return;
        }

        setUploadedFile(file);
        setPrediction(null);
        setShowTreatmentGuideDetails(false);
        setAnalysisError('');
        setUploadError('');

        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        loadImageFile(file);
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        loadImageFile(file);
    };

    const handleAnalyzeNow = async () => {
        if (!uploadedFile) {
            setAnalysisError('Please choose a crop image before analyzing.');
            return;
        }

        setIsAnalyzing(true);
        setAnalysisError('');

        try {
            const result = await predictDisease(uploadedFile, 3);
            setPrediction(result);
            setShowTreatmentGuideDetails(false);

            if (activeUserId) {
                try {
                    await saveDiseaseScan({
                        userId: activeUserId,
                        userEmail: user?.email || '',
                        fileName: uploadedFile.name,
                        fileType: uploadedFile.type || '',
                        fileSize: uploadedFile.size || 0,
                        predictedLabel: result.predictedLabel,
                        crop: result.crop,
                        condition: result.condition,
                        isHealthy: result.isHealthy,
                        confidence: result.confidence,
                        topPredictions: result.topPredictions || [],
                        scannedAt: new Date().toISOString(),
                        modelSource: 'plant-disease-inference',
                    });
                } catch (saveError) {
                    console.error('Save disease scan history error:', saveError);
                    setHistoryError('Prediction completed, but we could not save this scan to history.');
                }
            }
        } catch (error) {
            setAnalysisError(error.message || 'Unable to analyze this crop image right now.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const totalScans = scanHistory.length;
    const healthyScans = scanHistory.filter((scan) => scan.isHealthy).length;
    const diseaseAlerts = totalScans - healthyScans;
    const latestScan = scanHistory[0] || null;
    const mostFrequentCondition = getMostFrequentCondition(scanHistory);
    const treatmentGuide = prediction ? getTreatmentGuide(prediction) : null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-6 font-sans relative">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-10">
                    <div className="w-full xl:w-1/2 shrink-0">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-black text-xs uppercase tracking-widest mb-2 mt-2">
                            <Leaf size={12} /> Crop Health Check
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                            Disease <span className="text-emerald-600">Detection</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm max-w-lg">
                            Upload a clear photo of the leaf or affected crop area to review the likely condition,
                            confidence score, and suggested follow-up actions.
                        </p>
                    </div>
                </div>

                <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
                    <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-start md:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-600">Scan a Crop Image</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-900">Upload and review one sample at a time</h2>
                            <p className="mt-3 text-sm leading-relaxed text-slate-500">
                                A close, well-lit image usually gives the clearest result. This page stays focused on the current scan so it is easier to review.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            Supported: .jpg, .jpeg, .png, .webp, .bmp file
                        </div>
                    </div>

                    <div className="mt-8">
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-600">Before You Upload</p>
                        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {[
                                {
                                    title: 'Use one subject',
                                    description: 'Capture one leaf or the affected crop area so the scan is easier to interpret.',
                                },
                                {
                                    title: 'Prefer natural lighting',
                                    description: 'Good lighting helps spots, discoloration, and texture changes show clearly.',
                                },
                                {
                                    title: 'Avoid wide shots',
                                    description: 'Stay close enough for the disease pattern to be visible without heavy background clutter.',
                                },
                            ].map((tip, index) => (
                                <div key={tip.title} className="rounded-2xl bg-slate-50 p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-emerald-600 shadow-sm">
                                            {`0${index + 1}`}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900">{tip.title}</h3>
                                            <p className="mt-1 text-sm leading-relaxed text-slate-500">{tip.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                        <div
                            className={`mt-8 rounded-[2rem] border-2 border-dashed p-8 transition-all ${
                                isDragging
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-slate-200 bg-slate-50/80'
                            }`}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div
                                className="cursor-pointer text-center"
                                onClick={handleBrowseClick}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleBrowseClick();
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full shadow-sm ${
                                    isDragging ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500'
                                }`}>
                                    <Upload size={34} className="pointer-events-none" />
                                </div>
                                <h3 className="mt-6 text-2xl font-black text-slate-900">Choose a crop photo</h3>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Drag and drop here, or browse from your device.
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={ACCEPTED_IMAGE_EXTENSIONS.join(',')}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBrowseClick();
                                    }}
                                    className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-600"
                                >
                                    Browse Files
                                </button>
                            </div>

                            {uploadError && (
                                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                                    {uploadError}
                                </div>
                            )}

                            {uploadedImage && (
                                <div className="mt-8 border-t border-slate-200 pt-8">
                                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3">
                                        <img
                                            src={uploadedImage}
                                            alt="Uploaded crop"
                                            className="max-h-[28rem] w-full rounded-[1.25rem] object-contain"
                                        />
                                    </div>
                                    <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <p className="break-all text-sm font-medium text-slate-500">
                                            {uploadedFile?.name}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleAnalyzeNow}
                                            disabled={isAnalyzing}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    <span>Checking Image...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Check Image</span>
                                                    <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {analysisError && (
                                        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                            {analysisError}
                                        </div>
                                    )}

                                    {prediction && (
                                        <>
                                            <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Latest Scan Result</p>
                                                        <h4 className="mt-2 text-2xl font-black text-slate-900">{prediction.condition}</h4>
                                                        <p className="mt-1 text-sm font-medium text-slate-500">{prediction.crop}</p>
                                                    </div>
                                                    <div className={`inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${
                                                        prediction.isHealthy
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-rose-100 text-rose-700'
                                                    }`}>
                                                        {prediction.isHealthy ? 'Healthy' : 'Needs Attention'}
                                                    </div>
                                                </div>

                                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Confidence</p>
                                                        <p className="mt-2 text-3xl font-black text-slate-900">{(prediction.confidence * 100).toFixed(1)}%</p>
                                                    </div>
                                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Predicted Label</p>
                                                        <p className="mt-2 text-sm font-bold leading-relaxed text-slate-900">{prediction.predictedLabel}</p>
                                                    </div>
                                                </div>

                                                {!!prediction.topPredictions?.length && (
                                                    <div className="mt-6">
                                                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Other Likely Matches</p>
                                                        <div className="mt-3 space-y-3">
                                                            {prediction.topPredictions.map((item) => (
                                                                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-900">{item.condition}</p>
                                                                        <p className="text-xs text-slate-500">{item.crop}</p>
                                                                    </div>
                                                                    <p className="text-sm font-black text-emerald-700">{(item.confidence * 100).toFixed(1)}%</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {treatmentGuide && (
                                                <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                        <div className="max-w-3xl">
                                                            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Treatment Guide</p>
                                                            <h4 className="mt-2 text-xl font-black text-slate-900">{treatmentGuide.title}</h4>
                                                            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                                                {treatmentGuide.summary}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <div className={`inline-flex items-center rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-wide ${getUrgencyStyles(treatmentGuide.urgency)}`}>
                                                                {treatmentGuide.urgency} Priority
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowTreatmentGuideDetails((value) => !value)}
                                                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                                                            >
                                                                {showTreatmentGuideDetails ? 'Hide Details' : 'Show Details'}
                                                                <ChevronDown size={16} className={`transition-transform ${showTreatmentGuideDetails ? 'rotate-180' : ''}`} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {showTreatmentGuideDetails && (
                                                        <>
                                                            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
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
                                                                        <Leaf size={18} />
                                                                        <p className="text-sm font-black uppercase tracking-[0.18em]">Monitor Next</p>
                                                                    </div>
                                                                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                                                                        {treatmentGuide.monitorNext.map((check) => (
                                                                            <li key={check}>{check}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>

                                                            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                                                {treatmentGuide.disclaimer}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                </div>

                <div className="mt-14 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-600">Saved History</p>
                            <h2 className="mt-2 text-3xl font-black text-slate-900">Your previous scans stay in one place</h2>
                            <p className="mt-3 text-sm leading-relaxed text-slate-500">
                                This page stays focused on the current upload, while your earlier detections remain easy to review whenever you need them.
                            </p>
                        </div>

                        <Link
                            to="/disease-history"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                        >
                            Open Full History
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    {historyError && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            {historyError}
                        </div>
                    )}

                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-[2rem] bg-slate-50 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Total Scans</p>
                                    <p className="mt-3 text-4xl font-black text-slate-900">{totalScans}</p>
                                </div>
                                <div className="rounded-2xl bg-white p-4 shadow-sm">
                                    <Clock3 size={22} className="text-emerald-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-slate-500">
                                {historyLoading ? 'Updating your saved scan count...' : 'Each successful scan is stored automatically.'}
                            </p>
                        </div>

                        <div className="rounded-[2rem] bg-rose-50 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-500">Disease Alerts</p>
                                    <p className="mt-3 text-4xl font-black text-slate-900">{diseaseAlerts}</p>
                                </div>
                                <div className="rounded-2xl bg-white p-4 shadow-sm">
                                    <Activity size={22} className="text-rose-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-slate-500">
                                {healthyScans} healthy scans are also saved for comparison over time.
                            </p>
                        </div>

                        <div className="rounded-[2rem] bg-emerald-50 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">Latest Result</p>
                                    <p className="mt-3 text-2xl font-black text-slate-900">{latestScan ? latestScan.condition : 'No scans yet'}</p>
                                </div>
                                <div className="rounded-2xl bg-white p-4 shadow-sm">
                                    <ShieldCheck size={22} className="text-emerald-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-slate-500">
                                {latestScan
                                    ? `${formatScanDate(latestScan.scannedAt)} | most frequent: ${mostFrequentCondition}`
                                    : 'Analyze your first crop image to start a record.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiseaseDetection;
