import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Eye, Check, X, Download, Play, Heart, Gift, Star, DollarSign } from 'lucide-react';
import { TEMPLATES_URL, getTemplateImageUrl, AUTH_URL } from '../config';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { SkeletonGrid, LazyImage } from '../components/SkeletonLoader';

// Cache configuration
const CACHE_KEY = 'lorenotes_templates_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
    templates: Template[];
    timestamp: number;
}

interface Template {
    id: string;
    title: string;
    description: string;
    purpose: string;
    price: number;
    category: string;
    author: string;
    imageFileId: string;
    downloadCount: number;
    tutorialVideoUrl?: string;
}

export const TemplatesPage = () => {
    const location = useLocation();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
    const [videoModal, setVideoModal] = useState<{ isOpen: boolean; url: string; title: string }>({ isOpen: false, url: '', title: '' });
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; template: Template | null }>({ isOpen: false, template: null });
    const [sortBy] = useState<'recent' | 'price-low' | 'price-high'>('recent');
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const { addToCart, cart } = useCart();
    const { token, isAuthenticated } = useAuth();

    const categories = ['infografia', 'lineas_tiempo', 'caratulas', 'manualidades', 'separadores', 'mapas_mentales'];
    const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash && templates.length > 0 && !loading) {
            const template = templates.find(t => t.id === hash);
            if (template) {
                setPreviewModal({ isOpen: true, template });
                window.history.replaceState(null, '', location.pathname);
            }
        }
    }, [location.hash, templates, loading]);

    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const { templates: cachedTemplates, timestamp }: CachedData = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setTemplates(cachedTemplates);
                    setLoading(false);
                }
            } catch (e) {
                localStorage.removeItem(CACHE_KEY);
            }
        }
        loadAllData();
    }, []);

    useEffect(() => {
        if (isAuthenticated && token) {
            loadUserData();
        }
    }, [isAuthenticated, token]);

    const loadAllData = useCallback(async () => {
        try {
            const [templatesRes, categoriesRes] = await Promise.all([
                fetch(TEMPLATES_URL),
                fetch(`${AUTH_URL}/categories`)
            ]);

            if (templatesRes.ok) {
                const templatesData = await templatesRes.json();
                setTemplates(templatesData);
                const cacheData: CachedData = { templates: templatesData, timestamp: Date.now() };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            }

            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json();
                const customCats = categoriesData
                    .filter((c: { slug: string; isDefault: boolean }) => !c.isDefault)
                    .map((c: { slug: string }) => c.slug);
                setDynamicCategories(customCats);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadUserData = useCallback(async () => {
        if (!token) return;
        try {
            const [purchasesRes, favoritesRes] = await Promise.all([
                fetch(`${AUTH_URL}/purchases`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${AUTH_URL}/favorites`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (purchasesRes.ok) {
                const data = await purchasesRes.json();
                const ids = new Set<string>(data.purchases?.map((p: { templateId: string }) => p.templateId) || []);
                setPurchasedIds(ids);
            }

            if (favoritesRes.ok) {
                const data = await favoritesRes.json();
                setFavoriteIds(new Set(data.favorites.map((f: { templateId: string }) => f.templateId)));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }, [token]);

    const toggleFavorite = async (template: Template) => {
        if (!isAuthenticated) return;
        const isFavorite = favoriteIds.has(template.id);
        try {
            if (isFavorite) {
                await fetch(`${AUTH_URL}/favorites/${template.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setFavoriteIds(prev => {
                    const next = new Set(prev);
                    next.delete(template.id);
                    return next;
                });
            } else {
                await fetch(`${AUTH_URL}/favorites`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateId: template.id, title: template.title })
                });
                setFavoriteIds(prev => new Set([...prev, template.id]));
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const claimFreeTemplate = async (template: Template) => {
        if (!isAuthenticated) {
            alert('Inicia sesión para obtener esta plantilla');
            return;
        }
        try {
            const res = await fetch(`${AUTH_URL}/claim-free`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ templateId: template.id, title: template.title })
            });
            const data = await res.json();
            if (res.ok) {
                setPurchasedIds(prev => new Set([...prev, template.id]));
                alert('¡Plantilla obtenida! Ya puedes descargarla.');
            } else {
                alert(data.message || 'Error al obtener plantilla');
            }
        } catch (error) {
            console.error('Claim free error:', error);
            alert('Error de conexión');
        }
    };

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = !searchTerm ||
            t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
        return 0;
    });

    const getImageUrl = (template: Template) => {
        if (template.imageFileId) return getTemplateImageUrl(template.id);
        const placeholders: Record<string, string> = {
            infografia: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop',
            lineas_tiempo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
            caratulas: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
            manualidades: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=600&fit=crop',
            otros: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=600&fit=crop'
        };
        return placeholders[template.category] || placeholders.otros;
    };

    const getCategoryLabel = (cat: string) => {
        const labels: Record<string, string> = {
            infografia: 'Infografía',
            lineas_tiempo: 'Líneas de tiempo',
            caratulas: 'Carátulas',
            manualidades: 'Manualidades',
            separadores: 'Separadores',
            mapas_mentales: 'Mapas mentales',
            otros: 'Otros'
        };
        return labels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ');
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section with Collage */}
            <section className="py-8 md:py-12 px-4">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-3xl md:text-5xl font-serif text-elegant-black italic">LoreNotes</h1>
                        <p className="text-elegant-gray mt-2 text-lg">Las mejores plantillas en un solo lugar</p>
                    </motion.div>

                    <motion.div
                        className="relative h-48 md:h-64 hidden md:block"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {templates.slice(0, 4).map((template, idx) => (
                            <motion.div
                                key={template.id}
                                className="absolute rounded-lg overflow-hidden shadow-xl"
                                style={{
                                    width: idx === 0 ? '45%' : '35%',
                                    height: idx === 0 ? '100%' : '80%',
                                    top: idx === 0 ? '0' : idx === 1 ? '10%' : idx === 2 ? '5%' : '15%',
                                    left: idx === 0 ? '0' : idx === 1 ? '30%' : idx === 2 ? '55%' : '75%',
                                    zIndex: 4 - idx,
                                    rotate: idx === 0 ? -5 : idx === 1 ? 3 : idx === 2 ? -3 : 5,
                                }}
                                whileHover={{ scale: 1.05, zIndex: 10, rotate: 0 }}
                            >
                                <img src={getImageUrl(template)} alt={template.title} className="w-full h-full object-cover" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Search Bar */}
            <section className="px-4 pb-6">
                <div className="max-w-2xl mx-auto">
                    <div className="relative">
                        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-elegant-light" />
                        <input
                            type="text"
                            placeholder="Buscar plantillas creativas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-elegant-black/10 text-lg"
                        />
                    </div>
                </div>
            </section>

            {/* Category Pills */}
            <section className="px-4 pb-8">
                <div className="flex flex-wrap justify-center gap-3">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-5 py-2 rounded-full border text-sm font-medium transition-all
                            ${!selectedCategory ? 'bg-elegant-black text-white border-elegant-black' : 'bg-white text-elegant-gray border-gray-200 hover:border-gray-400'}`}
                    >
                        Todas
                    </button>
                    {[...categories, ...dynamicCategories].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2 rounded-full border text-sm font-medium transition-all
                                ${selectedCategory === cat ? 'bg-elegant-black text-white border-elegant-black' : 'bg-white text-elegant-gray border-gray-200 hover:border-gray-400'}`}
                        >
                            {getCategoryLabel(cat)}
                        </button>
                    ))}
                </div>
            </section>

            {/* Templates Grid - Masonry */}
            <section className="px-4 pb-12">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <SkeletonGrid count={8} />
                    ) : sortedTemplates.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-500">No se encontraron plantillas 😢</p>
                            <p className="text-gray-400 mt-2">Prueba con otra búsqueda o categoría</p>
                        </div>
                    ) : (
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
                            {sortedTemplates.map((template, idx) => (
                                <motion.div
                                    key={template.id}
                                    className="break-inside-avoid mb-5 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => setPreviewModal({ isOpen: true, template })}
                                >
                                    {/* Image Container */}
                                    <div
                                        className="relative overflow-hidden"
                                        style={{ aspectRatio: idx % 4 === 0 ? '3/4' : idx % 4 === 1 ? '4/5' : idx % 4 === 2 ? '3/3.5' : '4/4.5' }}
                                    >
                                        <LazyImage
                                            src={getImageUrl(template)}
                                            alt={template.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            fallbackSrc="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=600&fit=crop"
                                        />

                                        {/* Price Badge */}
                                        <div className="absolute top-3 right-3 bg-white text-elegant-black text-sm font-bold px-3 py-1 rounded-md shadow-md">
                                            {(template.price || 0) === 0 ? 'GRATIS' : `$${(template.price || 0).toFixed(0)}`}
                                        </div>

                                        {/* Hover Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPreviewModal({ isOpen: true, template }); }}
                                                className="p-3 rounded-full bg-white text-elegant-black hover:scale-110 transition-transform"
                                            >
                                                <Eye size={20} />
                                            </button>
                                            {isAuthenticated && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(template); }}
                                                    className={`p-3 rounded-full transition-transform hover:scale-110 ${favoriteIds.has(template.id) ? 'bg-red-500 text-white' : 'bg-white text-elegant-black'}`}
                                                >
                                                    <Heart size={20} fill={favoriteIds.has(template.id) ? 'currentColor' : 'none'} />
                                                </button>
                                            )}
                                            {purchasedIds.has(template.id) ? (
                                                <a
                                                    href={`${TEMPLATES_URL}/${template.id}/download`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-3 rounded-full bg-green-500 text-white hover:scale-110 transition-transform"
                                                >
                                                    <Download size={20} />
                                                </a>
                                            ) : (template.price || 0) === 0 ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); claimFreeTemplate(template); }}
                                                    className="p-3 rounded-full bg-green-500 text-white hover:scale-110 transition-transform"
                                                >
                                                    <Gift size={20} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (!template.id) return;
                                                        if (cart.some(item => item.templateId === template.id) || addedToCart.has(template.id)) return;
                                                        try {
                                                            const result = await addToCart({ templateId: template.id, title: template.title, price: template.price || 0 });
                                                            if (result.success) setAddedToCart(prev => new Set([...prev, template.id]));
                                                        } catch (error) { console.error('Error:', error); }
                                                    }}
                                                    className={`p-3 rounded-full transition-transform hover:scale-110 ${cart.some(item => item.templateId === template.id) || addedToCart.has(template.id) ? 'bg-green-500 text-white' : 'bg-white text-elegant-black'}`}
                                                >
                                                    {cart.some(item => item.templateId === template.id) || addedToCart.has(template.id) ? <Check size={20} /> : <ShoppingCart size={20} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-elegant-black line-clamp-1">{template.title}</h3>
                                        <p className="text-elegant-gray text-sm mt-1 line-clamp-2">{template.description || template.purpose || 'Plantilla creativa'}</p>

                                        {/* Rating & Author */}
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                                                    {(template.author || 'A').charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star key={star} size={14} className={star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Template Preview Modal */}
            <AnimatePresence>
                {previewModal.isOpen && previewModal.template && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setPreviewModal({ isOpen: false, template: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="relative">
                                <img
                                    src={getImageUrl(previewModal.template)}
                                    alt={previewModal.template.title}
                                    className="w-full h-64 object-cover"
                                />
                                <button
                                    onClick={() => setPreviewModal({ isOpen: false, template: null })}
                                    className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <span className="text-xs text-elegant-light uppercase tracking-wider">
                                    {getCategoryLabel(previewModal.template.category)}
                                </span>
                                <h2 className="text-2xl font-serif text-elegant-black mt-1">{previewModal.template.title}</h2>
                                <p className="text-elegant-gray mt-3">{previewModal.template.description || previewModal.template.purpose}</p>

                                <div className="flex items-center gap-2 mt-4">
                                    <DollarSign size={20} className="text-green-600" />
                                    <span className="text-2xl font-bold text-elegant-black">
                                        {(previewModal.template.price || 0) === 0 ? 'GRATIS' : `$${(previewModal.template.price || 0).toFixed(2)}`}
                                    </span>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    {previewModal.template.tutorialVideoUrl && (
                                        <button
                                            onClick={() => {
                                                setVideoModal({ isOpen: true, url: previewModal.template!.tutorialVideoUrl!, title: previewModal.template!.title });
                                                setPreviewModal({ isOpen: false, template: null });
                                            }}
                                            className="flex-1 py-3 px-4 bg-purple-500 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-purple-600 transition-colors"
                                        >
                                            <Play size={18} /> Ver Tutorial
                                        </button>
                                    )}
                                    {purchasedIds.has(previewModal.template.id) ? (
                                        <a
                                            href={`${TEMPLATES_URL}/${previewModal.template.id}/download`}
                                            className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                                        >
                                            <Download size={18} /> Descargar
                                        </a>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                if ((previewModal.template!.price || 0) === 0) {
                                                    await claimFreeTemplate(previewModal.template!);
                                                } else {
                                                    await addToCart({ templateId: previewModal.template!.id, title: previewModal.template!.title, price: previewModal.template!.price || 0 });
                                                }
                                                setPreviewModal({ isOpen: false, template: null });
                                            }}
                                            className="flex-1 py-3 px-4 bg-elegant-black text-white rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                                        >
                                            <ShoppingCart size={18} /> {(previewModal.template.price || 0) === 0 ? 'Obtener Gratis' : 'Agregar al Carrito'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Tutorial Modal */}
            <AnimatePresence>
                {videoModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setVideoModal({ isOpen: false, url: '', title: '' })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-serif text-elegant-black">📹 Video Tutorial</h3>
                                <button onClick={() => setVideoModal({ isOpen: false, url: '', title: '' })} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-4">{videoModal.title}</p>
                            <a
                                href={videoModal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                            >
                                🎬 Ver Tutorial
                            </a>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
