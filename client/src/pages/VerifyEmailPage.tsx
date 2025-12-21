import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CraftButton } from '../components/CraftButton';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:4000/api/auth';

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
            const response = await fetch(`${API_URL}/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (response.ok) {
                // Save token and redirect
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setSuccess('¡Verificado! Redirigiendo...');
                setTimeout(() => {
                    window.location.href = '/'; // Force reload to update auth state
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
            const response = await fetch(`${API_URL}/resend-code`, {
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
        <div className="min-h-[70vh] flex items-center justify-center">
            <motion.div
                className="bg-white/95 backdrop-blur-sm border-4 border-ink-black rounded-2xl p-10 shadow-[8px_8px_0px_rgba(45,49,66,0.3)] max-w-md w-full text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-6xl mb-4">📧</div>
                <h2 className="text-3xl font-heading mb-4 text-ink-black">
                    Verifica tu Email
                </h2>
                <p className="text-gray-600 mb-6">
                    Enviamos un código de 6 dígitos a:<br />
                    <strong className="text-ink-black">{email}</strong>
                </p>

                {error && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border-2 border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                        {success}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full p-4 border-4 border-dashed border-primary-craft rounded-xl text-center text-3xl font-heading tracking-[0.5em] bg-paper-white focus:outline-none"
                        placeholder="000000"
                        maxLength={6}
                        required
                    />

                    <CraftButton
                        variant="primary"
                        className="w-full justify-center"
                        disabled={loading || code.length !== 6}
                    >
                        {loading ? 'Verificando...' : 'Verificar Código'}
                    </CraftButton>
                </form>

                <button
                    onClick={handleResend}
                    className="mt-6 text-primary-craft font-bold hover:underline"
                >
                    ¿No recibiste el código? Reenviar
                </button>
            </motion.div>
        </div>
    );
};
