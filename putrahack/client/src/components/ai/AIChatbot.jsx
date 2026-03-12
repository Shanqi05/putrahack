import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Smile, Paperclip } from 'lucide-react';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: 'Hello! 👋 I\'m TripleGain AI Assistant. I can help you with crop disease detection, marketplace tips, and farming advice. What can I help you with today?',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Add user message
        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const botMessage = {
                id: messages.length + 2,
                type: 'bot',
                content: getBotResponse(inputValue),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
            setLoading(false);
        }, 1000);
    };

    const getBotResponse = (userInput) => {
        const responses = {
            disease: 'I can help detect crop diseases! Upload an image to our Disease Detection page, and our AI will analyze it within seconds. We can detect over 30 common crop diseases with 90%+ accuracy.',
            marketplace: 'The Marketplace is great for buying fresh produce directly from farmers or selling your harvest. You can set your own prices and connect with verified buyers. Would you like tips on pricing?',
            leftover: 'The Leftover Management section helps you reduce food waste and earn extra income from surplus crops. You can list your extras and connect with bulk buyers!',
            price: 'Product pricing depends on freshness, season, and location. Check current market rates in the Marketplace, or ask specific crop questions!',
            help: 'I can assist you with:\n• Crop disease identification\n• Marketplace tips and pricing\n• Leftover crop management\n• General farming advice\n\nWhat would you like to know?'
        };

        const input = userInput.toLowerCase();

        if (input.includes('disease')) return responses.disease;
        if (input.includes('marketplace') || input.includes('buy') || input.includes('sell')) return responses.marketplace;
        if (input.includes('leftover') || input.includes('surplus') || input.includes('waste')) return responses.leftover;
        if (input.includes('price') || input.includes('cost') || input.includes('rate')) return responses.price;
        if (input.includes('help') || input.includes('what') || input.includes('can')) return responses.help;

        return 'Great question! Could you provide more details? I can help with disease detection, marketplace tips, leftover management, or farming advice.';
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 z-[998] bg-gradient-to-br from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white rounded-full p-4 shadow-2xl hover:shadow-emerald-400/50 transition-all duration-300 transform hover:scale-110 border-2 border-white/30"
            >
                {isOpen ? (
                    <X size={28} />
                ) : (
                    <MessageCircle size={28} fill="white" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-8 z-[997] w-96 h-[600px] bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 mb-4">
                        <h3 className="text-xl font-black mb-1">TripleGain AI Assistant</h3>
                        <p className="text-emerald-100 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                            Always ready to help
                        </p>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                            >
                                <div
                                    className={`max-w-xs px-4 py-3 rounded-2xl ${msg.type === 'user'
                                            ? 'bg-emerald-500 text-white rounded-br-none'
                                            : 'bg-emerald-50 text-emerald-900 rounded-bl-none border border-emerald-200'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <p className={`text-xs mt-2 ${msg.type === 'user' ? 'text-emerald-100' : 'text-emerald-600'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl rounded-bl-none">
                                    <div className="flex items-center gap-2">
                                        <Loader size={16} className="animate-spin" />
                                        <span className="text-sm">AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Section */}
                    <div className="border-t border-emerald-100 p-4 bg-emerald-50/50">
                        {/* Quick Actions */}
                        <div className="mb-4 flex gap-2 flex-wrap">
                            <button className="text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-50 transition-colors font-semibold">
                                🌱 Diseases
                            </button>
                            <button className="text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-50 transition-colors font-semibold">
                                💰 Pricing
                            </button>
                            <button className="text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-50 transition-colors font-semibold">
                                ♻️ Leftover
                            </button>
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <button
                                type="button"
                                className="text-emerald-600 hover:text-emerald-700 p-2"
                            >
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-white border-2 border-emerald-200 focus:border-emerald-500 outline-none rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-300/30 transition-all"
                            />
                            <button
                                type="button"
                                className="text-emerald-600 hover:text-emerald-700 p-2"
                            >
                                <Smile size={20} />
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !inputValue.trim()}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;
