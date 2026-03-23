import React, { useEffect, useRef, useState } from 'react';
import { Loader, MessageCircle, Paperclip, Send, Smile, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';

const MAX_ATTACHMENT_SIZE_BYTES = 4 * 1024 * 1024;
const SUPPORTED_ATTACHMENT_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
];
const SUPPORTED_ATTACHMENT_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf,.txt';
const EMOJI_OPTIONS = ['🌱', '🍅', '🌽', '🍃', '💧', '☀️', '🌧️', '🔍', '✅', '⚠️', '📈', '🙏'];
const INITIAL_BOT_MESSAGE = {
    id: 1,
    type: 'bot',
    content: "Hello! I'm TripleGain AI Assistant. I can help with crop disease detection, marketplace tips, and farming advice. What can I help you with today?",
    timestamp: new Date(),
};

const formatFileSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            const base64Content = result.includes(',') ? result.split(',')[1] : result;
            resolve(base64Content);
        };
        reader.onerror = () => reject(new Error('Unable to read the selected file.'));
        reader.readAsDataURL(file);
    });

const AIChatbotFixed = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_BOT_MESSAGE]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState(null);
    const [attachmentError, setAttachmentError] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const attachmentInputRef = useRef(null);
    const textInputRef = useRef(null);
    const fallbackUserIdRef = useRef(`farmer_${Math.random().toString(36).slice(2, 11)}`);
    const userId = user?.id || user?.email || fallbackUserIdRef.current;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getFarmingContext = () => {
        const userData = localStorage.getItem('triplegain_user');

        if (!userData) {
            return { cropType: 'General', region: 'Not specified', season: 'Current' };
        }

        try {
            const parsed = JSON.parse(userData);
            return {
                cropType: parsed.cropType || 'General',
                region: parsed.region || 'Not specified',
                season: 'Current',
            };
        } catch (error) {
            return { cropType: 'General', region: 'Not specified', season: 'Current' };
        }
    };

    const resetAttachmentInput = () => {
        if (attachmentInputRef.current) {
            attachmentInputRef.current.value = '';
        }
    };

    const clearSelectedAttachment = () => {
        setSelectedAttachment(null);
        setAttachmentError('');
        resetAttachmentInput();
    };

    const handleAttachmentButtonClick = () => {
        setShowEmojiPicker(false);
        attachmentInputRef.current?.click();
    };

    const handleClearChat = async () => {
        setInputValue('');
        setShowEmojiPicker(false);
        clearSelectedAttachment();

        try {
            await fetch(getApiUrl('/chatbot/clear'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });
        } catch (error) {
            console.error('Clear chat error:', error);
        } finally {
            setMessages([
                {
                    ...INITIAL_BOT_MESSAGE,
                    timestamp: new Date(),
                },
            ]);
        }
    };

    const handleEmojiToggle = () => {
        setShowEmojiPicker((current) => !current);
    };

    const handleEmojiSelect = (emoji) => {
        const inputElement = textInputRef.current;

        if (!inputElement) {
            setInputValue((current) => `${current}${emoji}`);
            setShowEmojiPicker(false);
            return;
        }

        const selectionStart = inputElement.selectionStart ?? inputValue.length;
        const selectionEnd = inputElement.selectionEnd ?? inputValue.length;

        setInputValue((current) => {
            const nextValue = `${current.slice(0, selectionStart)}${emoji}${current.slice(selectionEnd)}`;
            return nextValue;
        });
        setShowEmojiPicker(false);

        requestAnimationFrame(() => {
            inputElement.focus();
            const nextCursorPosition = selectionStart + emoji.length;
            inputElement.setSelectionRange(nextCursorPosition, nextCursorPosition);
        });
    };

    const handleAttachmentChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!SUPPORTED_ATTACHMENT_TYPES.includes(file.type)) {
            setSelectedAttachment(null);
            setAttachmentError('Please attach a JPG, PNG, WEBP, PDF, or TXT file.');
            resetAttachmentInput();
            return;
        }

        if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
            setSelectedAttachment(null);
            setAttachmentError('Please keep attachments under 4 MB.');
            resetAttachmentInput();
            return;
        }

        try {
            const base64Data = await readFileAsBase64(file);
            setSelectedAttachment({
                name: file.name,
                mimeType: file.type,
                size: file.size,
                base64Data,
            });
            setAttachmentError('');
        } catch (error) {
            console.error('Attachment read error:', error);
            setSelectedAttachment(null);
            setAttachmentError(error.message || 'Unable to attach this file right now.');
            resetAttachmentInput();
        }
    };

    const handleSendMessage = async (messageText = inputValue) => {
        const trimmedMessage = messageText.trim();

        if (!trimmedMessage && !selectedAttachment) {
            return;
        }

        const outgoingAttachment = selectedAttachment;
        const userMessageId = Date.now();
        const botMessageId = userMessageId + 1;
        const displayMessage = trimmedMessage || `Attached ${outgoingAttachment.name}`;
        const backendMessage = trimmedMessage || 'Please review this attachment and help me understand it.';

        setMessages((prev) => [
            ...prev,
            {
                id: userMessageId,
                type: 'user',
                content: displayMessage,
                timestamp: new Date(),
                attachment: outgoingAttachment
                    ? {
                        name: outgoingAttachment.name,
                        mimeType: outgoingAttachment.mimeType,
                        size: outgoingAttachment.size,
                    }
                    : null,
            },
        ]);
        setInputValue('');
        setShowEmojiPicker(false);
        clearSelectedAttachment();
        setLoading(true);

        try {
            const response = await fetch(getApiUrl('/chatbot/chat'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    message: backendMessage,
                    farmingContext: getFarmingContext(),
                    attachment: outgoingAttachment
                        ? {
                            name: outgoingAttachment.name,
                            mimeType: outgoingAttachment.mimeType,
                            size: outgoingAttachment.size,
                            data: outgoingAttachment.base64Data,
                        }
                        : null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 503 && errorData.isQuotaError && errorData.fallbackReply) {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: botMessageId,
                            type: 'bot',
                            content: `Warning: ${errorData.message}\n\n${errorData.fallbackReply}`,
                            timestamp: new Date(),
                        },
                    ]);
                    setLoading(false);
                    return;
                }

                throw new Error(errorData.message || `API Error: ${response.status}`);
            }

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                {
                    id: botMessageId,
                    type: 'bot',
                    content: data.reply || data.fallbackReply || "Sorry, I couldn't process your request.",
                    timestamp: new Date(),
                },
            ]);
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    id: botMessageId,
                    type: 'bot',
                    content: `Connection issue. Please check:\n1. Backend API URL is correct\n2. Google AI API key is set in server/.env\n\nError: ${error.message}`,
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { emoji: '🌱', label: 'Diseases', message: 'What are the common crop diseases in my region and how can I prevent them?' },
        { emoji: '💰', label: 'Pricing', message: 'How can I get better prices for my crops in the marketplace?' },
        { emoji: '♻️', label: 'Leftover', message: 'How can I reduce crop waste and make use of leftover produce?' },
    ];

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 z-[9998] rounded-full border-2 border-white/30 bg-gradient-to-br from-emerald-400 to-green-500 p-4 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:from-emerald-500 hover:to-green-600 hover:shadow-emerald-400/50"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} fill="white" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-8 z-[9999] flex h-[600px] w-96 flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                    <div className="mb-4 bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="mb-1 text-xl font-black">TripleGain AI Assistant</h3>
                                <p className="flex items-center gap-2 text-sm text-emerald-100">
                                    <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse"></span>
                                    Always ready to help
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleClearChat}
                                disabled={loading}
                                className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Clear chat
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex animate-in fade-in slide-in-from-bottom-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs rounded-2xl px-4 py-3 ${
                                        msg.type === 'user'
                                            ? 'rounded-br-none bg-emerald-500 text-white'
                                            : 'rounded-bl-none border border-emerald-200 bg-emerald-50 text-emerald-900'
                                    }`}
                                >
                                    {msg.attachment && (
                                        <div
                                            className={`mb-3 rounded-2xl border px-3 py-2 text-xs ${
                                                msg.type === 'user'
                                                    ? 'border-white/30 bg-white/15 text-emerald-50'
                                                    : 'border-emerald-200 bg-white text-emerald-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold">{msg.attachment.name}</p>
                                                    <p className={msg.type === 'user' ? 'text-emerald-100' : 'text-emerald-500'}>
                                                        {formatFileSize(msg.attachment.size)} | {msg.attachment.mimeType}
                                                    </p>
                                                </div>
                                                <Paperclip size={14} />
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <p className={`mt-2 text-xs ${msg.type === 'user' ? 'text-emerald-100' : 'text-emerald-600'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl rounded-bl-none border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
                                    <div className="flex items-center gap-2">
                                        <Loader size={16} className="animate-spin" />
                                        <span className="text-sm">AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-emerald-100 bg-emerald-50/50 p-4">
                        <div className="mb-4 flex flex-wrap gap-2">
                            {quickActions.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => handleSendMessage(action.message)}
                                    disabled={loading}
                                    className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {action.emoji} {action.label}
                                </button>
                            ))}
                        </div>

                        <input
                            ref={attachmentInputRef}
                            type="file"
                            accept={SUPPORTED_ATTACHMENT_ACCEPT}
                            onChange={handleAttachmentChange}
                            className="hidden"
                        />

                        {(selectedAttachment || attachmentError) && (
                            <div className="mb-3 space-y-2">
                                {selectedAttachment && (
                                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-700">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold">{selectedAttachment.name}</p>
                                            <p className="text-emerald-500">
                                                {formatFileSize(selectedAttachment.size)} | {selectedAttachment.mimeType}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearSelectedAttachment}
                                            className="rounded-full p-1 text-emerald-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                                            title="Remove attachment"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}

                                {attachmentError && <p className="text-xs font-semibold text-red-600">{attachmentError}</p>}
                                <p className="text-[11px] text-emerald-600">
                                    Supported attachments: JPG, PNG, WEBP, PDF, TXT up to 4 MB.
                                </p>
                            </div>
                        )}

                        {showEmojiPicker && (
                            <div className="mb-3 rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm">
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                                    Quick emoji
                                </p>
                                <div className="grid grid-cols-6 gap-2">
                                    {EMOJI_OPTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => handleEmojiSelect(emoji)}
                                            className="rounded-xl border border-emerald-100 bg-emerald-50 px-2 py-2 text-lg transition-colors hover:border-emerald-300 hover:bg-emerald-100"
                                            title={`Insert ${emoji}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex gap-2"
                        >
                            <button
                                type="button"
                                onClick={handleAttachmentButtonClick}
                                disabled={loading}
                                className="p-2 text-emerald-600 transition-colors hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Attach file"
                            >
                                <Paperclip size={20} />
                            </button>
                            <input
                                ref={textInputRef}
                                type="text"
                                value={inputValue}
                                onChange={(event) => setInputValue(event.target.value)}
                                placeholder={selectedAttachment ? 'Add a message or send the attachment...' : 'Ask me anything...'}
                                className="flex-1 rounded-2xl border-2 border-emerald-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={handleEmojiToggle}
                                disabled={loading}
                                className="p-2 text-emerald-600 transition-colors hover:text-emerald-700"
                                title="Add emoji"
                            >
                                <Smile size={20} />
                            </button>
                            <button
                                type="submit"
                                disabled={loading || (!inputValue.trim() && !selectedAttachment)}
                                className="rounded-xl bg-emerald-500 p-2 text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Send message"
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

export default AIChatbotFixed;
