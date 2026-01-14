import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <motion.div
                className="bg-white rounded-2xl p-8 md:p-12 shadow-lg w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-lavender-soft rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail size={28} className="text-elegant-black" />
                    </div>
                    <h2 className="text-3xl font-serif text-elegant-black mb-2">
                        Recuperar contraseña
                    </h2>
                    <p className="text-elegant-gray text-sm">
                        Te enviaremos un código a tu correo
                    </p>
                </div>

                {success ? (
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="text-center p-6 bg-green-50 rounded-xl"
                    >
                        <div className="text-4xl mb-3">📧</div>
                        <p className="text-green-700 font-medium">¡Código enviado!</p>
                        <p className="text-green-600 text-sm mt-2">Revisa tu email...</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20 transition-all"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-elegant-black text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enviando...' : 'Enviar código'}
                        </button>
                    </form>
                )}

                <p className="text-center mt-8">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1 text-elegant-light hover:text-elegant-black transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> Volver al login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};
