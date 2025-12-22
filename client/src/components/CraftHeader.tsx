import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, LogOut, User, Menu, X, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export const CraftHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const { cartCount } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuItems = [
        { name: 'Inicio', path: '/' },
        { name: 'Plantillas', path: '/templates' },
        { name: 'Blog', path: '/blog' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMobileMenuOpen(false);
    };

    return (
        <header className="relative z-50 px-4 md:px-8 pt-4 md:pt-6 pb-2">
            <div className="flex items-center justify-between border-b-4 border-ink-black pb-4 bg-gradient-to-b from-paper-white to-orange-50/50 rounded-t-xl shadow-sm px-4">

                {/* Logo Section */}
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <motion.div
                        className="relative cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                    >
                        <h1 className="text-2xl md:text-4xl font-heading font-bold text-ink-black tracking-tight">
                            Lore<span className="text-primary-craft">Notes</span>
                        </h1>
                        <motion.div
                            className="absolute -top-2 -right-4 md:-top-4 md:-right-6 text-warning-yellow"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <Star fill="currentColor" size={16} className="md:w-6 md:h-6" />
                        </motion.div>
                    </motion.div>
                </Link>

                {/* Desktop Navigation */}
                {isAuthenticated && (
                    <nav className="hidden lg:flex items-end gap-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link key={item.name} to={item.path}>
                                    <motion.div
                                        className={`
                                            px-4 py-2 rounded-t-lg border-t-2 border-x-2 border-ink-black font-heading font-bold cursor-pointer text-sm
                                            ${isActive
                                                ? 'bg-white z-10 relative border-b-0'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-50'
                                            }
                                        `}
                                        whileHover={{ y: -3 }}
                                    >
                                        {item.name}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>
                )}

                {/* Desktop User Actions */}
                <div className="hidden md:flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            {/* User Info */}
                            <div className="flex items-center gap-2 bg-accent-craft/30 px-3 py-1.5 rounded-full border-2 border-ink-black">
                                <User size={16} />
                                <span className="font-heading text-xs">{user?.username}</span>
                                {user?.role === 'admin' && (
                                    <span className="bg-primary-craft text-white text-xs px-2 py-0.5 rounded-full">Admin</span>
                                )}
                            </div>

                            {/* Admin Link */}
                            {user?.role === 'admin' && (
                                <Link to="/admin">
                                    <motion.button
                                        className="bg-accent-craft text-ink-black px-3 py-1.5 rounded-full border-2 border-ink-black font-heading font-bold text-sm"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        Admin
                                    </motion.button>
                                </Link>
                            )}

                            {/* Account Link */}
                            <Link to="/account">
                                <motion.button
                                    className="bg-gray-100 text-ink-black p-2 rounded-full border-2 border-ink-black"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="Mi Cuenta"
                                >
                                    <Settings size={16} />
                                </motion.button>
                            </Link>

                            {/* Cart */}
                            <Link to="/cart">
                                <motion.button
                                    className="relative bg-primary-craft text-white p-2 rounded-full border-2 border-ink-black"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ShoppingCart size={18} />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-success-green border border-ink-black text-ink-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                            {cartCount}
                                        </span>
                                    )}
                                </motion.button>
                            </Link>

                            {/* Logout */}
                            <motion.button
                                onClick={handleLogout}
                                className="bg-gray-200 text-ink-black p-2 rounded-full border-2 border-ink-black"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Cerrar sesión"
                            >
                                <LogOut size={16} />
                            </motion.button>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Link to="/login">
                                <motion.button
                                    className="px-4 py-1.5 font-heading font-bold border-2 border-ink-black rounded-lg bg-white hover:bg-gray-50 text-sm"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Entrar
                                </motion.button>
                            </Link>
                            <Link to="/register">
                                <motion.button
                                    className="px-4 py-1.5 font-heading font-bold border-2 border-ink-black rounded-lg bg-primary-craft text-white text-sm"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Registrarse
                                </motion.button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 rounded-lg border-2 border-ink-black bg-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-x-4 border-b-4 border-ink-black rounded-b-xl overflow-hidden"
                    >
                        <div className="p-4 space-y-3">
                            {/* User Info (Mobile) */}
                            {isAuthenticated && user && (
                                <div className="flex items-center gap-2 bg-accent-craft/30 px-4 py-2 rounded-lg border-2 border-ink-black">
                                    <User size={20} />
                                    <span className="font-heading">{user.username}</span>
                                    {user.role === 'admin' && (
                                        <span className="bg-primary-craft text-white text-xs px-2 py-0.5 rounded-full ml-auto">Admin</span>
                                    )}
                                </div>
                            )}

                            {/* Navigation Links (Mobile) */}
                            {isAuthenticated && menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <div className={`
                                            px-4 py-3 rounded-lg font-heading font-bold border-2 border-ink-black
                                            ${isActive ? 'bg-primary-craft text-white' : 'bg-gray-50'}
                                        `}>
                                            {item.name}
                                        </div>
                                    </Link>
                                );
                            })}

                            {/* Admin Link (Mobile) */}
                            {user?.role === 'admin' && (
                                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="px-4 py-3 rounded-lg font-heading font-bold border-2 border-ink-black bg-accent-craft">
                                        Panel Admin
                                    </div>
                                </Link>
                            )}

                            {/* Auth Buttons (Mobile) */}
                            {!isAuthenticated ? (
                                <div className="flex gap-2">
                                    <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                                        <div className="px-4 py-3 rounded-lg font-heading font-bold border-2 border-ink-black bg-white text-center">
                                            Entrar
                                        </div>
                                    </Link>
                                    <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                                        <div className="px-4 py-3 rounded-lg font-heading font-bold border-2 border-ink-black bg-primary-craft text-white text-center">
                                            Registrarse
                                        </div>
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-3 rounded-lg font-heading font-bold border-2 border-ink-black bg-gray-200 flex items-center justify-center gap-2"
                                >
                                    <LogOut size={18} /> Cerrar Sesión
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
