import React, { useState } from 'react';
import { Microscope, Upload, CheckCircle, AlertCircle, Leaf, ArrowRight } from 'lucide-react';

const DiseaseDetection = () => {
    const [uploadedImage, setUploadedImage] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

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
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Start Scanning Your Crops</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Upload Box */}
                        <div className="bg-white rounded-3xl p-12 shadow-xl border-2 border-dashed border-orange-300">
                            <label className="text-center cursor-pointer">
                                <div className="mb-6">
                                    <Upload size={64} className="mx-auto text-orange-500 animate-bounce" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Upload Crop Image</h3>
                                <p className="text-slate-600 mb-6">Drag and drop or click to browse</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <button type="button" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all">
                                    Choose File
                                </button>
                            </label>

                            {uploadedImage && (
                                <div className="mt-8">
                                    <img src={uploadedImage} alt="Uploaded crop" className="w-full h-48 object-cover rounded-xl" />
                                    <button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-black hover:scale-105 transition-transform flex items-center justify-center space-x-2">
                                        <span>Analyze Now</span>
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Features List */}
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-orange-100 p-4 rounded-xl flex-shrink-0">
                                    <Microscope size={24} className="text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900">AI-Powered Analysis</h3>
                                    <p className="text-slate-600 text-sm">Deep learning models trained on 1M+ crop images</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-green-100 p-4 rounded-xl flex-shrink-0">
                                    <CheckCircle size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900">Instant Results</h3>
                                    <p className="text-slate-600 text-sm">Get accurate diagnosis in seconds with confidence scores</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-yellow-100 p-4 rounded-xl flex-shrink-0">
                                    <AlertCircle size={24} className="text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900">Treatment Guide</h3>
                                    <p className="text-slate-600 text-sm">Get actionable recommendations and preventive measures</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-4 rounded-xl flex-shrink-0">
                                    <Leaf size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900">Historical Tracking</h3>
                                    <p className="text-slate-600 text-sm">Monitor disease trends across your crops over time</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Common Diseases Section */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Diseases We Can Detect</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: 'Early Blight', accuracy: '94%', crop: 'Tomato' },
                            { name: 'Powdery Mildew', accuracy: '92%', crop: 'Wheat' },
                            { name: 'Leaf Rust', accuracy: '96%', crop: 'Coffee' },
                            { name: 'Bacterial Spot', accuracy: '88%', crop: 'Pepper' },
                            { name: 'Anthracnose', accuracy: '91%', crop: 'Mango' },
                            { name: 'Septoria Blotch', accuracy: '89%', crop: 'Corn' },
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
                        <button className="bg-white text-orange-600 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform">
                            Get Started Free
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiseaseDetection;
