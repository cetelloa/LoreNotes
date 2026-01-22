import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export const NotFoundPage = () => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <motion.div
                className="text-center max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* 404 Number with gradient */}
                <motion.h1
                    className="text-8xl md:text-9xl font-serif font-bold bg-gradient-to-r from-pastel-purple to-pastel-pink bg-clip-text text-transparent"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                    404
                </motion.h1>

                {/* Message */}
                <motion.h2
                    className="text-2xl font-serif text-elegant-black mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    ¡Ups! Página no encontrada
                </motion.h2>

                <motion.p
                    className="text-elegant-gray mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Parece que esta página se perdió entre nuestras plantillas creativas.
                    No te preocupes, te ayudamos a volver.
                </motion.p>

                {/* Decorative elements */}
                <motion.div
                    className="flex justify-center gap-2 my-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-3 h-3 rounded-full bg-gradient-to-r from-pastel-purple to-pastel-pink"
                            animate={{
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.1,
                            }}
                        />
                    ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Link to="/">
                        <motion.button
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pastel-purple to-pastel-pink text-white rounded-full font-medium hover:opacity-90 transition-all shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Home size={18} />
                            Ir al Inicio
                        </motion.button>
                    </Link>

                    <Link to="/templates">
                        <motion.button
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-elegant-black border border-pastel-lavender rounded-full font-medium hover:bg-pastel-lavender/20 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Search size={18} />
                            Ver Plantillas
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Back link */}
                <motion.div
                    className="mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    <button
                        onClick={() => window.history.back()}
                        className="text-elegant-gray hover:text-pastel-purple flex items-center gap-1 mx-auto transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Volver atrás
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};
