import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AUTH_URL } from '../config';
import { Mail } from 'lucide-react';

export const VerifyEmailPage = () => {
    const location = useLocation();
    const email = location.state?.email || '';
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${AUTH_URL}/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setSuccess('¡Verificado! Redirigiendo...');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Error de conexión. Intenta de nuevo.');
        }
        setLoading(false);
    };

    const handleResend = async () => {
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${AUTH_URL}/resend-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess('Código reenviado. Revisa tu email.');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Error al reenviar código.');
        }
    };

    if (!email) {
        navigate('/register');
        return null;
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <motion.div
                className="bg-white rounded-2xl p-8 md:p-12 shadow-lg max-w-md w-full text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="w-16 h-16 bg-lavender-soft rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-elegant-gray" />
                </div>

                <h2 className="text-3xl font-serif mb-4 text-elegant-black">
                    Verifica tu Email
                </h2>
                <p className="text-elegant-gray mb-8">
                    Enviamos un código de 6 dígitos a:<br />
                    <span className="text-elegant-black font-medium">{email}</span>
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full p-4 bg-cream rounded-xl text-center text-2xl font-medium tracking-[0.5em] text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                        placeholder="000000"
                        maxLength={6}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full bg-elegant-black text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verificando...' : 'Verificar Código'}
                    </button>
                </form>

                <button
                    onClick={handleResend}
                    className="mt-6 text-elegant-gray hover:text-elegant-black transition-colors text-sm"
                >
                    ¿No recibiste el código? <span className="font-medium">Reenviar</span>
                </button>
            </motion.div>
        </div>
    );
};
