import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, KeyRound, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AUTH_URL } from '../config';

export const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email] = useState(location.state?.email || '');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${AUTH_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.message || 'Error al restablecer contraseña');
            }
        } catch {
            setError('Error de conexión');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl p-8 md:p-12 shadow-lg w-full max-w-md text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-serif text-elegant-black mb-2">¡Contraseña actualizada!</h2>
                    <p className="text-elegant-gray">Redirigiendo al login...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <motion.div
                className="bg-white rounded-2xl p-8 md:p-12 shadow-lg w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <KeyRound size={28} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-serif text-elegant-black mb-2">
                        Nueva contraseña
                    </h2>
                    <p className="text-elegant-gray text-sm">
                        Ingresa el código que recibiste
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="bg-lavender-soft/50 p-3 rounded-xl text-center">
                        <p className="text-xs text-elegant-gray">Código enviado a</p>
                        <p className="text-elegant-black font-medium">{email}</p>
                    </div>

                    <div>
                        <label className="block text-elegant-gray text-sm mb-2">
                            Código de 6 dígitos
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full p-4 bg-cream rounded-xl text-elegant-black text-center text-2xl tracking-[0.4em] font-medium focus:outline-none focus:ring-2 focus:ring-elegant-black/20 transition-all"
                            placeholder="• • • • • •"
                            maxLength={6}
                            required
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-elegant-gray text-sm mb-2">
                            <Lock size={14} /> Nueva contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-4 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20 transition-all pr-12"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-elegant-light hover:text-elegant-gray"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-elegant-gray text-sm mb-2">
                            <Lock size={14} /> Confirmar contraseña
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-4 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20 transition-all"
                            placeholder="Repite la contraseña"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-elegant-black text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Actualizando...' : 'Cambiar contraseña'}
                    </button>
                </form>

                <p className="text-center mt-8">
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center gap-1 text-elegant-light hover:text-elegant-black transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> Reenviar código
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};
