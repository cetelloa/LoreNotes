import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { CraftButton } from '../components/CraftButton';
import { motion } from 'framer-motion';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = await login(email, password);

        if (success) {
            navigate('/');
        } else {
            setError('Credenciales incorrectas. Intenta de nuevo.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[60vh] md:min-h-[70vh] flex items-center justify-center px-4">
            <motion.div
                className="bg-white/95 backdrop-blur-sm border-4 border-ink-black rounded-2xl p-6 md:p-10 shadow-[4px_4px_0px_rgba(45,49,66,0.3)] md:shadow-[8px_8px_0px_rgba(45,49,66,0.3)] w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-2xl md:text-4xl font-heading text-center mb-6 md:mb-8 text-ink-black">
                    ¡Bienvenido! 👋
                </h2>

                {error && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded-lg mb-4 md:mb-6 text-sm md:text-base">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    <div>
                        <label className="block font-heading text-ink-black mb-1 md:mb-2 text-sm md:text-base">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 md:p-4 border-2 md:border-3 border-dashed border-ink-black rounded-xl font-body text-base md:text-xl bg-paper-white focus:outline-none focus:border-primary-craft"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-heading text-ink-black mb-1 md:mb-2 text-sm md:text-base">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 md:p-4 border-2 md:border-3 border-dashed border-ink-black rounded-xl font-body text-base md:text-xl bg-paper-white focus:outline-none focus:border-primary-craft"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <CraftButton
                        variant="primary"
                        className="w-full text-center justify-center"
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Iniciar Sesión'}
                    </CraftButton>
                </form>

                <p className="text-center mt-6 md:mt-8 font-body text-gray-600 text-sm md:text-base">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-primary-craft font-bold hover:underline">
                        Regístrate aquí
                    </Link>
                </p>
                <p className="text-center mt-3 font-body text-sm">
                    <Link to="/forgot-password" className="text-gray-500 hover:text-primary-craft transition-colors">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};
