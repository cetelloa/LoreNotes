import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CraftButton } from '../components/CraftButton';
import { motion } from 'framer-motion';
import { AUTH_URL } from '../config';

export const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok && data.requiresVerification) {
                navigate('/verify-email', { state: { email } });
            } else if (!response.ok) {
                setError(data.message || 'Error al registrar');
            }
        } catch (err) {
            setError('Error de conexión. Intenta de nuevo.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-[60vh] md:min-h-[70vh] flex items-center justify-center px-4 py-4">
            <motion.div
                className="bg-white/95 backdrop-blur-sm border-4 border-ink-black rounded-2xl p-6 md:p-10 shadow-[4px_4px_0px_rgba(45,49,66,0.3)] md:shadow-[8px_8px_0px_rgba(45,49,66,0.3)] w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-2xl md:text-4xl font-heading text-center mb-4 md:mb-8 text-ink-black">
                    ¡Únete! ✨
                </h2>

                {error && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-5">
                    <div>
                        <label className="block font-heading text-ink-black mb-1 text-sm md:text-base">Nombre de usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border-2 border-dashed border-ink-black rounded-xl font-body text-base bg-paper-white focus:outline-none focus:border-primary-craft"
                            placeholder="Tu nombre creativo"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-heading text-ink-black mb-1 text-sm md:text-base">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border-2 border-dashed border-ink-black rounded-xl font-body text-base bg-paper-white focus:outline-none focus:border-primary-craft"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-heading text-ink-black mb-1 text-sm md:text-base">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border-2 border-dashed border-ink-black rounded-xl font-body text-base bg-paper-white focus:outline-none focus:border-primary-craft"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-heading text-ink-black mb-1 text-sm md:text-base">Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 border-2 border-dashed border-ink-black rounded-xl font-body text-base bg-paper-white focus:outline-none focus:border-primary-craft"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <CraftButton
                        variant="accent"
                        className="w-full text-center justify-center"
                        disabled={loading}
                    >
                        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </CraftButton>
                </form>

                <p className="text-center mt-4 md:mt-8 font-body text-gray-600 text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-primary-craft font-bold hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};
