import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, RotateCcw } from 'lucide-react';
import { CHATBOT_URL } from '../config';
import { useAuth } from '../context/AuthContext';

// Generate unique session ID
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('chat-session-id');
    if (!sessionId) {
        sessionId = 'session-' + Math.random().toString(36).substring(7);
        sessionStorage.setItem('chat-session-id', sessionId);
    }
    return sessionId;
};

interface Message {
    role: 'user' | 'ai';
    content: string;
}

interface Template {
    id: string;
    title: string;
    category: string;
    price: number;
}

export const ChatWidget = () => {
    const { isAuthenticated } = useAuth();

    // Only show chat widget when user is logged in
    if (!isAuthenticated) {
        return null;
    }

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(CHATBOT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    sessionId: getSessionId()
                })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'ai', content: data.response || 'No pude responder.' }]);
            if (data.templates) {
                setTemplates(data.templates);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Error al conectar con el asistente. 😔' }]);
        }
        setLoading(false);
    };

    const handleClearChat = async () => {
        try {
            await fetch(`${CHATBOT_URL}/clear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: getSessionId() })
            });
        } catch (e) { /* ignore */ }
        setMessages([]);
        setTemplates([]);
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-primary-craft to-secondary-craft text-white p-4 rounded-full shadow-lg border-4 border-ink-black"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 left-6 z-50 w-[90vw] max-w-[380px] md:w-[380px] bg-white rounded-2xl shadow-2xl border-4 border-ink-black overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-craft to-secondary-craft p-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-white font-heading font-bold text-lg flex items-center gap-2">
                                    <MessageCircle size={20} /> LoreBot 🎨
                                </h3>
                                <p className="text-white/80 text-xs">Tu asistente creativo</p>
                            </div>
                            <button
                                onClick={handleClearChat}
                                className="text-white/80 hover:text-white p-1"
                                title="Reiniciar conversación"
                            >
                                <RotateCcw size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="h-[320px] overflow-y-auto p-4 space-y-3 bg-paper-white">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-400 text-sm mt-8 space-y-2">
                                    <p className="text-2xl">👋</p>
                                    <p>¡Hola! Soy LoreBot.</p>
                                    <p>Pregúntame sobre plantillas para bodas, cumpleaños, negocios y más.</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                        max-w-[85%] p-3 rounded-xl text-sm
                                        ${msg.role === 'user'
                                            ? 'bg-secondary-craft text-ink-black rounded-br-none border-2 border-ink-black'
                                            : 'bg-white text-ink-black rounded-bl-none border-2 border-gray-200 shadow-sm'}
                                    `}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {/* Template suggestions */}
                            {templates.length > 0 && messages.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {templates.slice(0, 3).map((t, idx) => (
                                        <div key={idx} className="bg-accent-craft/30 text-xs px-2 py-1 rounded-full border border-accent-craft">
                                            {t.title} - ${t.price?.toFixed(2)}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border-2 border-gray-200 p-3 rounded-xl rounded-bl-none shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-primary-craft rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-primary-craft rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-primary-craft rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t-2 border-gray-200 bg-white flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Escribe tu mensaje..."
                                className="flex-1 p-2 border-2 border-dashed border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-craft"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="bg-primary-craft text-white p-2 rounded-lg disabled:opacity-50 hover:bg-primary-craft/80 transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
