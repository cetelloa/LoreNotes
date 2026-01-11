import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <motion.div
                className="bg-white rounded-2xl p-8 md:p-12 shadow-lg w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-3xl md:text-4xl font-serif text-center mb-8 text-elegant-black">
                    Crear Cuenta
                </h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-elegant-gray text-sm mb-2">
                            Nombre de usuario
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-4 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20 transition-all"
                            placeholder="Tu nombre"
                            required
                        />
                    </div>

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

                    <div>
                        <label className="block text-elegant-gray text-sm mb-2">
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-4 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-elegant-black text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </button>
                </form>

                <p className="text-center mt-8 text-elegant-gray text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-elegant-black font-medium hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};
