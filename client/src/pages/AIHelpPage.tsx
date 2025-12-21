import { useState } from 'react';
import { api } from '../services/api';
import { CraftButton } from '../components/CraftButton';

export const AIHelpPage = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const data = await api.sendMessage(userMsg);
            setMessages(prev => [...prev, { role: 'ai', content: data.response || 'No response' }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Error al conectar con el asistente.' }]);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm border-4 border-ink-black rounded-xl p-4 md:p-8 shadow-lg max-w-2xl mx-auto min-h-[400px] md:min-h-[500px] flex flex-col">
            <h2 className="text-2xl md:text-4xl font-heading mb-4 md:mb-6 text-center">Ayuda Creativa IA 🤖</h2>

            <div className="flex-1 overflow-y-auto mb-4 md:mb-6 space-y-4 p-3 md:p-4 bg-paper-white/50 rounded-lg border-2 border-dashed border-gray-300">
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 italic mt-10 text-sm md:text-base">
                        Pregúntame sobre ideas para bodas, cumpleaños o scrapbooking...
                    </p>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                            max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-xl border-2 border-ink-black text-sm md:text-base
                            ${msg.role === 'user' ? 'bg-secondary-craft text-ink-black' : 'bg-white text-ink-black'}
                        `}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && <p className="text-center text-gray-400">Pensando...</p>}
            </div>

            <div className="flex gap-2 md:gap-4">
                <input
                    className="flex-1 p-2 md:p-3 border-2 border-ink-black rounded-lg font-body text-base"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu idea aquí..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <CraftButton onClick={handleSend} disabled={loading}>
                    Enviar
                </CraftButton>
            </div>
        </div>
    );
};
