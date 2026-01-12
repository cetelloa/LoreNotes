import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, LogOut, Menu, X, Settings, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export const CraftHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const { cartCount } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

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
        <header className="relative z-50 bg-cream">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">

                    {/* Logo - Elegant Text */}
                    <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                        <motion.h1
                            className="text-xl md:text-2xl font-serif italic text-elegant-black tracking-wide"
                            whileHover={{ opacity: 0.7 }}
                        >
                            LoreNotes
                        </motion.h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link key={item.name} to={item.path}>
                                    <span className={`
                                        text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'text-elegant-black'
                                            : 'text-elegant-gray hover:text-elegant-black'
                                        }
                                    `}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}

                        {/* User Menu with Dropdown */}
                        {isAuthenticated && (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-1 text-sm text-elegant-gray hover:text-elegant-black transition-colors"
                                >
                                    Cuenta
                                    <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2"
                                            onMouseLeave={() => setDropdownOpen(false)}
                                        >
                                            <Link
                                                to="/cart"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-elegant-gray hover:bg-cream transition-colors"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <ShoppingCart size={16} />
                                                Carrito {cartCount > 0 && `(${cartCount})`}
                                            </Link>
                                            <Link
                                                to="/account"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-elegant-gray hover:bg-cream transition-colors"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <Settings size={16} />
                                                Mi Cuenta
                                            </Link>
                                            <hr className="my-2 border-gray-100" />
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-elegant-gray hover:bg-cream transition-colors w-full text-left"
                                            >
                                                <LogOut size={16} />
                                                Cerrar Sesión
                                            </button>
                                            {isAdmin && (
                                                <>
                                                    <hr className="my-2 border-gray-100" />
                                                    <Link
                                                        to="/admin"
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-elegant-black font-medium hover:bg-cream transition-colors"
                                                        onClick={() => setDropdownOpen(false)}
                                                    >
                                                        ⚙️ Panel Admin
                                                    </Link>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {!isAuthenticated && (
                            <Link to="/login">
                                <button className="bg-elegant-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                                    Iniciar Sesión
                                </button>
                            </Link>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100"
                    >
                        <div className="px-6 py-4 space-y-3">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-2 text-elegant-gray hover:text-elegant-black transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {isAuthenticated && (
                                <>
                                    <hr className="border-gray-100" />
                                    <Link
                                        to="/cart"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2 py-2 text-elegant-gray hover:text-elegant-black"
                                    >
                                        <ShoppingCart size={18} />
                                        Mi Carrito {cartCount > 0 && `(${cartCount})`}
                                    </Link>
                                    <Link
                                        to="/account"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2 py-2 text-elegant-gray hover:text-elegant-black"
                                    >
                                        <Settings size={18} />
                                        Mi Cuenta
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 py-2 text-elegant-gray hover:text-elegant-black w-full"
                                    >
                                        <LogOut size={18} />
                                        Cerrar Sesión
                                    </button>
                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-2 py-2 text-elegant-black font-medium"
                                        >
                                            ⚙️ Panel Admin
                                        </Link>
                                    )}
                                </>
                            )}

                            {!isAuthenticated && (
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <button className="w-full bg-elegant-black text-white py-3 rounded-full text-sm font-medium">
                                        Iniciar Sesión
                                    </button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
