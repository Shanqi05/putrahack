import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Microscope, Upload, CheckCircle, AlertCircle, Leaf, ArrowRight, Loader2, Clock3, Activity, ShieldCheck, ChevronDown } from 'lucide-react';
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
    const uploadSectionRef = useRef(null);
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

    const scrollToUploader = () => {
        uploadSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
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
        <div className="pt-24 px-6 pb-20 bg-gradient-to-b from-slate-50 to-orange-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Hero Section */}
                <div className="relative p-12 md:p-20 rounded-[3rem] overflow-hidden shadow-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white mb-20">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-300/20 rounded-full blur-[100px]"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8">
                            <Microscope size={16} className="text-orange-200" />
                            <span className="text-sm font-bold uppercase">AI Disease Detection</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-6">Detect Diseases Early, Save Your Harvest</h1>
                        <p className="text-lg text-orange-100 mb-8 max-w-2xl">
                            Our advanced AI analyzes crop images to detect diseases 48+ hours before they become visible. Upload your crop photos and get instant diagnosis with treatment recommendations.
                        </p>
                    </div>
                </div>

                {/* Upload Section */}
                <div ref={uploadSectionRef} className="mb-20">
                    <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Start Scanning Your Crops</h2>

                    <div className="mx-auto max-w-4xl">
                        <div
                            className={`bg-white rounded-3xl p-12 shadow-xl border-2 border-dashed transition-all ${
                                isDragging
                                    ? 'border-orange-500 bg-orange-50/80'
                                    : 'border-orange-300'
                            }`}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div
                                className="text-center cursor-pointer"
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
                                <div className="mb-6">
                                    <Upload size={64} className="mx-auto text-orange-500 animate-bounce pointer-events-none" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Upload Crop Image</h3>
                                <p className="text-slate-600 mb-6">Drag and drop or click to browse</p>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-4">
                                    Supported: .jpg, .jpeg, .png, .webp, .bmp
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
                                    className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all"
                                >
                                    Choose File
                                </button>
                            </div>

                            {uploadError && (
                                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                                    {uploadError}
                                </div>
                            )}

                            {uploadedImage && (
                                <div className="mt-8">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                        <img
                                            src={uploadedImage}
                                            alt="Uploaded crop"
                                            className="w-full max-h-[28rem] object-contain rounded-xl"
                                        />
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-slate-500 break-all">
                                        {uploadedFile?.name}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleAnalyzeNow}
                                        disabled={isAnalyzing}
                                        className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-black hover:scale-105 transition-transform flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                <span>Analyzing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Analyze Now</span>
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>

                                    {analysisError && (
                                        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                            {analysisError}
                                        </div>
                                    )}

                                    {prediction && (
                                        <>
                                            <div className="mt-6 rounded-3xl bg-slate-900 text-white p-6 shadow-xl">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.25em] text-orange-200 font-bold">Model Prediction</p>
                                                        <h4 className="mt-2 text-2xl font-black">{prediction.condition}</h4>
                                                        <p className="mt-1 text-sm text-slate-300">{prediction.crop}</p>
                                                    </div>
                                                    <div className={`px-3 py-2 rounded-2xl text-xs font-black uppercase tracking-wide ${prediction.isHealthy ? 'bg-emerald-400 text-emerald-950' : 'bg-red-400 text-red-950'}`}>
                                                        {prediction.isHealthy ? 'Healthy' : 'Disease Found'}
                                                    </div>
                                                </div>

                                                <div className="mt-6 grid grid-cols-2 gap-4">
                                                    <div className="rounded-2xl bg-white/10 p-4">
                                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Confidence</p>
                                                        <p className="mt-2 text-3xl font-black">{(prediction.confidence * 100).toFixed(1)}%</p>
                                                    </div>
                                                    <div className="rounded-2xl bg-white/10 p-4">
                                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Predicted Label</p>
                                                        <p className="mt-2 text-sm font-bold leading-relaxed text-slate-100">{prediction.predictedLabel}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Top Matches</p>
                                                    <div className="mt-3 space-y-3">
                                                        {prediction.topPredictions.map((item) => (
                                                            <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                                                                <div>
                                                                    <p className="font-bold text-sm text-white">{item.condition}</p>
                                                                    <p className="text-xs text-slate-400">{item.crop}</p>
                                                                </div>
                                                                <p className="text-sm font-black text-orange-200">{(item.confidence * 100).toFixed(1)}%</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {treatmentGuide && (
                                                <div className="mt-6 rounded-3xl border border-orange-100 bg-white p-6 shadow-xl">
                                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                        <div>
                                                            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-500">Treatment Guide</p>
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
                                                                className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-orange-700 transition hover:bg-orange-100"
                                                            >
                                                                {showTreatmentGuideDetails ? 'Hide Details' : 'Show Details'}
                                                                <ChevronDown size={16} className={`transition-transform ${showTreatmentGuideDetails ? 'rotate-180' : ''}`} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {showTreatmentGuideDetails && (
                                                        <>
                                                            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                                                                <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
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

                                                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
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

                                                                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
                                                                    <div className="flex items-center gap-2 text-sky-700">
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
                </div>

                <div className="mb-20 rounded-[3rem] border border-orange-100 bg-white p-8 shadow-xl">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-500">Historical Tracking</p>
                            <h2 className="mt-2 text-4xl font-black text-slate-900">Keep The Detection Page Clean</h2>
                            <p className="mt-3 text-slate-600">
                                Your scan history now lives on a dedicated page, so this screen stays focused on uploading, analyzing, and reviewing the latest treatment guide.
                            </p>
                        </div>

                        <Link
                            to="/disease-history"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white transition hover:bg-slate-800"
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
                        <div className="rounded-3xl border border-orange-100 bg-orange-50 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Total Scans</p>
                                    <p className="mt-3 text-4xl font-black text-slate-900">{totalScans}</p>
                                </div>
                                <div className="rounded-2xl bg-white p-4 shadow-sm">
                                    <Clock3 size={22} className="text-orange-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-slate-600">
                                {historyLoading ? 'Updating your saved scan count...' : 'Every successful scan is saved automatically.'}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Disease Alerts</p>
                                    <p className="mt-3 text-4xl font-black text-slate-900">{diseaseAlerts}</p>
                                </div>
                                <div className="rounded-2xl bg-white p-4 shadow-sm">
                                    <Activity size={22} className="text-rose-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-slate-600">
                                {healthyScans} healthy scans are also stored for baseline comparison.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Latest Result</p>
                                    <p className="mt-3 text-2xl font-black text-slate-900">{latestScan ? latestScan.condition : 'No scans yet'}</p>
                                </div>
                                <div className="rounded-2xl bg-white p-4 shadow-sm">
                                    <ShieldCheck size={22} className="text-emerald-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-slate-600">
                                {latestScan
                                    ? `${formatScanDate(latestScan.scannedAt)} | most frequent result: ${mostFrequentCondition}`
                                    : 'Analyze your first crop image to start building history.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-20 rounded-[3rem] border border-slate-100 bg-white p-8 shadow-xl">
                    <div className="max-w-3xl">
                        <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-500">What You Get</p>
                        <h2 className="mt-2 text-4xl font-black text-slate-900">Everything Around Each Scan</h2>
                        <p className="mt-3 text-slate-600">
                            The diagnosis card stays focused on the current upload, while the supporting features live here in a cleaner overview section.
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-3xl border border-orange-100 bg-orange-50 p-6">
                            <div className="inline-flex rounded-2xl bg-white p-4 shadow-sm">
                                <Microscope size={24} className="text-orange-600" />
                            </div>
                            <h3 className="mt-5 text-lg font-black text-slate-900">AI-Powered Analysis</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Deep learning models trained on 1M+ crop images.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
                            <div className="inline-flex rounded-2xl bg-white p-4 shadow-sm">
                                <CheckCircle size={24} className="text-emerald-600" />
                            </div>
                            <h3 className="mt-5 text-lg font-black text-slate-900">Instant Results</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Get accurate diagnosis in seconds with confidence scores.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
                            <div className="inline-flex rounded-2xl bg-white p-4 shadow-sm">
                                <AlertCircle size={24} className="text-amber-600" />
                            </div>
                            <h3 className="mt-5 text-lg font-black text-slate-900">Treatment Guide</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Get actionable recommendations and preventive measures.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-sky-100 bg-sky-50 p-6">
                            <div className="inline-flex rounded-2xl bg-white p-4 shadow-sm">
                                <Leaf size={24} className="text-sky-600" />
                            </div>
                            <h3 className="mt-5 text-lg font-black text-slate-900">Historical Tracking</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Every successful scan is saved automatically to your farming history.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Common Diseases Section */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Diseases We Can Detect</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[ 
                            { name: 'Tomato Early Blight', accuracy: '94%', crop: 'Tomato' },
                            { name: 'Potato Late Blight', accuracy: '97%', crop: 'Potato' },
                            { name: 'Corn Common Rust', accuracy: '95%', crop: 'Corn (Maize)' },
                            { name: 'Peach Bacterial Spot', accuracy: '93%', crop: 'Peach' },
                            { name: 'Pepper Bacterial Spot', accuracy: '91%', crop: 'Pepper' },
                            { name: 'Tomato Leaf Mold', accuracy: '92%', crop: 'Tomato' },
                        ].map((disease, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all">
                                <h3 className="font-black text-lg text-slate-900 mb-2">{disease.name}</h3>
                                <p className="text-slate-600 text-sm mb-4">Common in: <span className="font-bold">{disease.crop}</span></p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-orange-600">Detection Accuracy</span>
                                    <span className="text-2xl font-black text-orange-600">{disease.accuracy}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 text-white overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-black mb-4">Protect Your Crops Today</h3>
                        <p className="text-lg text-orange-100 mb-8 max-w-2xl">Start monitoring your fields with AI-powered disease detection.</p>
                        <button
                            type="button"
                            onClick={scrollToUploader}
                            className="bg-white text-orange-600 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform"
                        >
                            Start Scanning Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiseaseDetection;
