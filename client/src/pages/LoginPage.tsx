import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <motion.div
                className="bg-white rounded-2xl p-8 md:p-12 shadow-lg w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-3xl md:text-4xl font-serif text-center mb-8 text-elegant-black">
                    Bienvenido
                </h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
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

                    <div>
                        <label className="block text-elegant-gray text-sm mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-elegant-black text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Entrando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="text-center mt-8 text-elegant-gray text-sm">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-elegant-black font-medium hover:underline">
                        Regístrate aquí
                    </Link>
                </p>
                <p className="text-center mt-3 text-sm">
                    <Link to="/forgot-password" className="text-elegant-light hover:text-elegant-black transition-colors">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};
