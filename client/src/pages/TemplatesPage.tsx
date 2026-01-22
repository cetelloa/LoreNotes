import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, DollarSign, ShoppingCart, Eye, Check, X, Download, Play, ArrowUpDown, Heart, Gift } from 'lucide-react';
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
    const [sortBy, setSortBy] = useState<'recent' | 'price-low' | 'price-high'>('recent');
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const { addToCart, cart } = useCart();
    const { token, isAuthenticated } = useAuth();

    const categories = ['infografia', 'lineas_tiempo', 'caratulas', 'manualidades', 'separadores', 'mapas_mentales'];
    const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);

    // Handle deep linking - open preview modal for template in URL hash
    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash && templates.length > 0 && !loading) {
            const template = templates.find(t => t.id === hash);
            if (template) {
                setPreviewModal({ isOpen: true, template });
                // Clear the hash from URL after opening
                window.history.replaceState(null, '', location.pathname);
            }
        }
    }, [location.hash, templates, loading]);

    // Load cached templates immediately for faster initial render
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
        // Always fetch fresh data in background
        loadAllData();
    }, []);

    // Re-fetch user-specific data when auth changes
    useEffect(() => {
        if (isAuthenticated && token) {
            loadUserData();
        }
    }, [isAuthenticated, token]);

    // Parallel loading of all public data
    const loadAllData = useCallback(async () => {
        try {
            const [templatesRes, categoriesRes] = await Promise.all([
                fetch(TEMPLATES_URL),
                fetch(`${AUTH_URL}/categories`)
            ]);

            // Process templates
            if (templatesRes.ok) {
                const templatesData = await templatesRes.json();
                setTemplates(templatesData);
                // Cache the templates
                const cacheData: CachedData = {
                    templates: templatesData,
                    timestamp: Date.now()
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            }

            // Process categories
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

    // Parallel loading of user-specific data
    const loadUserData = useCallback(async () => {
        if (!token) return;
        try {
            const [purchasesRes, favoritesRes] = await Promise.all([
                fetch(`${AUTH_URL}/purchases`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${AUTH_URL}/favorites`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
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
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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

    // Apply sorting
    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
        return 0; // recent = original order
    });

    const getImageUrl = (template: Template) => {
        if (template.imageFileId) {
            return getTemplateImageUrl(template.id);
        }
        // Placeholder images based on category
        const placeholders: Record<string, string> = {
            bodas: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
            cumpleanos: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
            negocios: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
            educacion: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
            otros: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop'
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
        <div className="space-y-6">
            {/* Header - Compact */}
            <motion.div
                className="py-6 md:py-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl md:text-4xl font-serif text-elegant-black">Explora Plantillas</h1>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                className="bg-white p-4 rounded-2xl flex flex-col md:flex-row gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {/* Search */}
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-elegant-light" />
                    <input
                        type="text"
                        placeholder="Buscar plantillas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-cream rounded-full border-none focus:outline-none focus:ring-2 focus:ring-elegant-black/10"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                            ${!selectedCategory ? 'bg-elegant-black text-white' : 'bg-cream text-elegant-gray hover:bg-cream-dark'}`}
                    >
                        Todas
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                                ${selectedCategory === cat ? 'bg-elegant-black text-white' : 'bg-cream text-elegant-gray hover:bg-cream-dark'}`}
                        >
                            {getCategoryLabel(cat)}
                        </button>
                    ))}
                    {dynamicCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                                ${selectedCategory === cat ? 'bg-elegant-black text-white' : 'bg-cream text-elegant-gray hover:bg-cream-dark'}`}
                        >
                            {getCategoryLabel(cat)}
                        </button>
                    ))}
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2">
                    <ArrowUpDown size={16} className="text-elegant-gray" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'recent' | 'price-low' | 'price-high')}
                        className="bg-cream px-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-elegant-black/10"
                    >
                        <option value="recent">Recientes</option>
                        <option value="price-low">Precio: Menor a Mayor</option>
                        <option value="price-high">Precio: Mayor a Menor</option>
                    </select>
                </div>
            </motion.div>

            {/* Templates Grid */}
            {loading ? (
                <SkeletonGrid count={6} />
            ) : sortedTemplates.length === 0 ? (
                <div className="text-center py-12 bg-white/90 rounded-xl border-4 border-ink-black">
                    <p className="text-xl text-gray-500">No se encontraron plantillas 😢</p>
                    <p className="text-gray-400 mt-2">Prueba con otra búsqueda o categoría</p>
                </div>
            ) : (
                /* Pinterest/Masonry Style Grid */
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                    {sortedTemplates.map((template, idx) => (
                        <motion.div
                            key={template.id}
                            className="break-inside-avoid mb-4 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all group cursor-pointer"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => setPreviewModal({ isOpen: true, template })}
                        >
                            {/* Large Image - Variable Height for Masonry Effect */}
                            <div
                                className="relative overflow-hidden bg-cream"
                                style={{
                                    aspectRatio: idx % 3 === 0 ? '3/4' : idx % 3 === 1 ? '4/5' : '3/3.5'
                                }}
                            >
                                <LazyImage
                                    src={getImageUrl(template)}
                                    alt={template.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    fallbackSrc="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=600&fit=crop"
                                />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewModal({ isOpen: true, template });
                                            }}
                                            className="p-3 rounded-full bg-white/90 text-elegant-black hover:bg-white transition-colors"
                                            title="Ver vista previa"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        {isAuthenticated && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(template);
                                                }}
                                                className={`p-3 rounded-full transition-colors ${favoriteIds.has(template.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-100'}`}
                                                title={favoriteIds.has(template.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                                            >
                                                <Heart size={18} fill={favoriteIds.has(template.id) ? 'currentColor' : 'none'} />
                                            </button>
                                        )}
                                        {purchasedIds.has(template.id) ? (
                                            <a
                                                href={`${TEMPLATES_URL}/${template.id}/download`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                                                title="Descargar"
                                                download
                                            >
                                                <Download size={18} />
                                            </a>
                                        ) : (template.price || 0) === 0 ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    claimFreeTemplate(template);
                                                }}
                                                className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                                                title="Obtener gratis"
                                            >
                                                <Gift size={18} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!template.id) return;
                                                    const inCart = cart.some(item => item.templateId === template.id);
                                                    if (inCart || addedToCart.has(template.id)) return;
                                                    try {
                                                        const result = await addToCart({
                                                            templateId: template.id,
                                                            title: template.title,
                                                            price: template.price || 0
                                                        });
                                                        if (result.success) {
                                                            setAddedToCart(prev => new Set([...prev, template.id]));
                                                        }
                                                    } catch (error) {
                                                        console.error('Error:', error);
                                                    }
                                                }}
                                                className={`p-3 rounded-full transition-colors ${cart.some(item => item.templateId === template.id) || addedToCart.has(template.id)
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-white/90 text-elegant-black hover:bg-white'
                                                    }`}
                                                title={cart.some(item => item.templateId === template.id) ? 'En el carrito' : 'Agregar al carrito'}
                                            >
                                                {cart.some(item => item.templateId === template.id) || addedToCart.has(template.id)
                                                    ? <Check size={18} />
                                                    : <ShoppingCart size={18} />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Price Badge */}
                                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-elegant-black text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                                    {(template.price || 0) === 0 ? 'GRATIS' : `$${(template.price || 0).toFixed(2)}`}
                                </div>

                                {/* Category Tag */}
                                <div className="absolute top-3 left-3 bg-elegant-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                                    {getCategoryLabel(template.category)}
                                </div>
                            </div>

                            {/* Minimal Content Below Image */}
                            <div className="p-4">
                                <h3 className="font-serif font-medium text-elegant-black line-clamp-1 group-hover:text-purple-600 transition-colors">
                                    {template.title}
                                </h3>
                                <p className="text-elegant-gray text-sm mt-1 line-clamp-1">
                                    {template.description || template.purpose}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

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
                            className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border-4 border-ink-black overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* PDF Preview */}
                            <div className="relative h-64 md:h-80 bg-gray-200">
                                <iframe
                                    src={`${TEMPLATES_URL}/${previewModal.template.id}/preview#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-full border-0 pointer-events-none"
                                    title={`Vista previa de ${previewModal.template.title}`}
                                />
                                {/* Overlay to block right-click and interactions */}
                                <div
                                    className="absolute inset-0 z-5"
                                    onContextMenu={(e) => e.preventDefault()}
                                    style={{ userSelect: 'none' }}
                                />
                                <button
                                    onClick={() => setPreviewModal({ isOpen: false, template: null })}
                                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors z-10"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute bottom-3 left-3 bg-accent-craft text-ink-black text-sm font-bold px-3 py-1 rounded-full border-2 border-ink-black z-10">
                                    {getCategoryLabel(previewModal.template.category)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="font-heading font-bold text-2xl text-ink-black mb-2">
                                    {previewModal.template.title}
                                </h3>
                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {previewModal.template.description || previewModal.template.purpose || 'Plantilla de diseño creativo para tus proyectos.'}
                                </p>

                                {/* Price */}
                                <div className="flex items-center gap-2 mb-6">
                                    <DollarSign size={24} className="text-primary-craft" />
                                    <span className="text-3xl font-bold text-primary-craft">
                                        {(previewModal.template.price || 0).toFixed(2)}
                                    </span>
                                </div>

                                {/* Tutorial Button */}
                                {previewModal.template.tutorialVideoUrl ? (
                                    <button
                                        onClick={() => {
                                            setVideoModal({
                                                isOpen: true,
                                                url: previewModal.template!.tutorialVideoUrl!,
                                                title: previewModal.template!.title
                                            });
                                            setPreviewModal({ isOpen: false, template: null });
                                        }}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-heading hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Play size={20} />
                                        Ver Tutorial
                                    </button>
                                ) : (
                                    <p className="text-center text-gray-400 text-sm">
                                        📹 Tutorial próximamente disponible
                                    </p>
                                )}
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
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-4 border-ink-black"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-heading text-ink-black">📹 Video Tutorial</h3>
                                <button
                                    onClick={() => setVideoModal({ isOpen: false, url: '', title: '' })}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-4">{videoModal.title}</p>
                            <p className="text-sm text-gray-500 mb-4">
                                Aprende cómo usar esta plantilla con nuestro video tutorial en redes sociales.
                            </p>
                            <a
                                href={videoModal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center rounded-xl font-heading hover:from-purple-600 hover:to-pink-600 transition-all"
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
