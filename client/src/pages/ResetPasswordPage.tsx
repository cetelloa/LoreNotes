import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, KeyRound, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CraftButton } from '../components/CraftButton';
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
            <div className="min-h-[60vh] flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-10 bg-white/95 rounded-2xl border-4 border-ink-black shadow-[8px_8px_0px_rgba(45,49,66,0.3)]"
                >
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={40} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-heading text-ink-black mb-2">¡Contraseña actualizada!</h2>
                    <p className="text-gray-600">Redirigiendo al login...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/95 backdrop-blur-sm border-4 border-ink-black rounded-2xl p-8 shadow-[8px_8px_0px_rgba(45,49,66,0.3)]"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <KeyRound size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-heading text-ink-black">Restablecer contraseña</h1>
                    <p className="text-gray-600 mt-2">Ingresa el código que recibiste por email</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl text-center text-sm">
                            {error}
                        </div>
                    )}

                    <div className="p-3 bg-purple-50 rounded-xl text-center">
                        <p className="text-sm text-gray-600">Código enviado a:</p>
                        <p className="font-heading text-purple-700">{email}</p>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 font-heading mb-2 text-sm">
                            Código de 6 dígitos
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full p-4 border-2 border-dashed border-ink-black rounded-xl focus:border-primary-craft focus:outline-none transition-colors text-center text-2xl tracking-[0.5em] font-heading"
                            placeholder="••••••"
                            maxLength={6}
                            required
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 font-heading mb-2 text-sm">
                            <Lock size={16} /> Nueva contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 border-2 border-dashed border-ink-black rounded-xl focus:border-primary-craft focus:outline-none transition-colors pr-12"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 font-heading mb-2 text-sm">
                            <Lock size={16} /> Confirmar contraseña
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 border-2 border-dashed border-ink-black rounded-xl focus:border-primary-craft focus:outline-none transition-colors"
                            placeholder="Repite la contraseña"
                            required
                        />
                    </div>

                    <CraftButton variant="primary" className="w-full justify-center" disabled={loading}>
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Actualizando...
                            </span>
                        ) : (
                            'Restablecer contraseña'
                        )}
                    </CraftButton>

                    <Link
                        to="/forgot-password"
                        className="flex items-center justify-center gap-2 text-gray-500 hover:text-primary-craft transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> Reenviar código
                    </Link>
                </form>
            </motion.div>
        </div>
    );
};
