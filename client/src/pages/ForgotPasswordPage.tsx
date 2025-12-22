import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CraftButton } from '../components/CraftButton';
import { AUTH_URL } from '../config';

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${AUTH_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/reset-password', { state: { email } });
                }, 2000);
            } else {
                setError(data.message || 'Error al procesar solicitud');
            }
        } catch {
            setError('Error de conexión');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/95 backdrop-blur-sm border-4 border-ink-black rounded-2xl p-8 shadow-[8px_8px_0px_rgba(45,49,66,0.3)]"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-heading text-ink-black">¿Olvidaste tu contraseña?</h1>
                    <p className="text-gray-600 mt-2">Te enviaremos un código para recuperarla</p>
                </div>

                {success ? (
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200"
                    >
                        <div className="text-4xl mb-3">📧</div>
                        <p className="text-green-700 font-heading">¡Código enviado!</p>
                        <p className="text-green-600 text-sm mt-2">Revisa tu email y prepárate para ingresar el código...</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl text-center text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="flex items-center gap-2 font-heading mb-2">
                                <Mail size={18} /> Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border-2 border-dashed border-ink-black rounded-xl focus:border-primary-craft focus:outline-none transition-colors"
                                placeholder="tu-email@ejemplo.com"
                                required
                            />
                        </div>

                        <CraftButton variant="primary" className="w-full justify-center" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Enviando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Send size={18} /> Enviar código
                                </span>
                            )}
                        </CraftButton>

                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 text-gray-500 hover:text-primary-craft transition-colors"
                        >
                            <ArrowLeft size={18} /> Volver al login
                        </Link>
                    </form>
                )}
            </motion.div>
        </div>
    );
};
