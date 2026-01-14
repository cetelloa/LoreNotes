import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, DollarSign, ShoppingCart, Eye, Check, X, Download, Play } from 'lucide-react';
import { TEMPLATES_URL, getTemplateImageUrl, AUTH_URL } from '../config';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
    const [videoModal, setVideoModal] = useState<{ isOpen: boolean; url: string; title: string }>({ isOpen: false, url: '', title: '' });
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; template: Template | null }>({ isOpen: false, template: null });
    const { addToCart, cart } = useCart();
    const { token, isAuthenticated } = useAuth();

    const categories = ['bodas', 'cumpleanos', 'negocios', 'educacion', 'otros'];

    useEffect(() => {
        fetchTemplates();
        if (isAuthenticated) {
            fetchPurchases();
        }
    }, [isAuthenticated]);

    const fetchTemplates = async () => {
        try {
            const res = await fetch(TEMPLATES_URL);
            const data = await res.json();
            setTemplates(data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
        setLoading(false);
    };

    const fetchPurchases = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${AUTH_URL}/purchases`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const ids = new Set<string>(data.purchases?.map((p: { templateId: string }) => p.templateId) || []);
                setPurchasedIds(ids);
            }
        } catch (error) {
            console.error('Error fetching purchases:', error);
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
            bodas: 'Bodas',
            cumpleanos: 'Cumpleaños',
            negocios: 'Negocios',
            educacion: 'Educación',
            otros: 'Otros'
        };
        return labels[cat] || cat;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                className="py-8 md:py-12 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl md:text-5xl font-serif text-elegant-black mb-3">Plantillas</h1>
                <p className="text-elegant-gray">Encuentra la plantilla perfecta para tu proyecto</p>
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
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${!selectedCategory ? 'bg-elegant-black text-white' : 'bg-cream text-elegant-gray hover:bg-cream-dark'}`}
                    >
                        Todas
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                ${selectedCategory === cat ? 'bg-elegant-black text-white' : 'bg-cream text-elegant-gray hover:bg-cream-dark'}`}
                        >
                            {getCategoryLabel(cat)}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Templates Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-primary-craft border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-500">Cargando plantillas...</p>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12 bg-white/90 rounded-xl border-4 border-ink-black">
                    <p className="text-xl text-gray-500">No se encontraron plantillas 😢</p>
                    <p className="text-gray-400 mt-2">Prueba con otra búsqueda o categoría</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredTemplates.map((template, idx) => (
                        <motion.div
                            key={template.id}
                            className="bg-white rounded-xl border-4 border-ink-black overflow-hidden shadow-[4px_4px_0px_rgba(45,49,66,0.2)] hover:shadow-[6px_6px_0px_rgba(45,49,66,0.3)] transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -4 }}
                        >
                            {/* Image */}
                            <div className="relative h-40 md:h-48 overflow-hidden bg-gray-100">
                                <img
                                    src={getImageUrl(template)}
                                    alt={template.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop';
                                    }}
                                />
                                <div className="absolute top-2 right-2 bg-accent-craft text-ink-black text-xs font-bold px-2 py-1 rounded-full border-2 border-ink-black">
                                    {getCategoryLabel(template.category)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-heading font-bold text-lg text-ink-black line-clamp-1">{template.title}</h3>
                                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{template.description || template.purpose}</p>

                                {/* Meta */}
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-1 text-primary-craft font-bold">
                                        <DollarSign size={16} />
                                        <span>{(template.price || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex gap-2 relative z-10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewModal({ isOpen: true, template });
                                            }}
                                            className="p-3 rounded-lg bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors"
                                            title="Ver vista previa"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        {purchasedIds.has(template.id) ? (
                                            // Already purchased - show download button
                                            <a
                                                href={`${TEMPLATES_URL}/${template.id}/download`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 active:bg-green-700 transition-colors flex items-center gap-1"
                                                title="Descargar plantilla"
                                                download
                                            >
                                                <Download size={20} />
                                            </a>
                                        ) : (
                                            // Not purchased - show cart button
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();

                                                    if (!template.id) {
                                                        alert(`Error: Esta plantilla "${template.title}" no tiene un ID válido.`);
                                                        return;
                                                    }

                                                    const inCart = cart.some(item => item.templateId === template.id);
                                                    if (inCart || addedToCart.has(template.id)) {
                                                        alert('Esta plantilla ya está en tu carrito.');
                                                        return;
                                                    }

                                                    try {
                                                        const result = await addToCart({
                                                            templateId: template.id,
                                                            title: template.title,
                                                            price: template.price || 0
                                                        });
                                                        if (result.success) {
                                                            setAddedToCart(prev => new Set([...prev, template.id]));
                                                        } else {
                                                            alert(result.message || 'No se pudo agregar al carrito.');
                                                        }
                                                    } catch (error) {
                                                        console.error('Error adding to cart:', error);
                                                        alert('Error de conexión.');
                                                    }
                                                }}
                                                className={`p-3 rounded-lg transition-colors flex items-center gap-1 ${cart.some(item => item.templateId === template.id) || addedToCart.has(template.id)
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-primary-craft text-white hover:bg-primary-craft/80 active:bg-primary-craft/90'
                                                    }`}
                                                title={cart.some(item => item.templateId === template.id) ? 'En el carrito' : 'Agregar al carrito'}
                                            >
                                                {cart.some(item => item.templateId === template.id) || addedToCart.has(template.id)
                                                    ? <Check size={20} />
                                                    : <ShoppingCart size={20} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
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
                                    className="w-full h-full border-0"
                                    title={`Vista previa de ${previewModal.template.title}`}
                                />
                                <button
                                    onClick={() => setPreviewModal({ isOpen: false, template: null })}
                                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors z-10"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute bottom-3 left-3 bg-accent-craft text-ink-black text-sm font-bold px-3 py-1 rounded-full border-2 border-ink-black">
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
