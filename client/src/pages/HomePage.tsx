import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CraftButton } from '../components/CraftButton';
import { Sparkles, Heart, Cake, Briefcase, GraduationCap, Star, Download, ArrowRight } from 'lucide-react';
import { TEMPLATES_URL } from '../config';

interface Template {
    id: string;
    title: string;
    description: string;
    purpose: string;
    price: number;
    category: string;
    downloadCount: number;
}

// Category icons mapping
const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
        bodas: <Heart className="text-pink-500" size={32} />,
        cumpleanos: <Cake className="text-orange-500" size={32} />,
        negocios: <Briefcase className="text-blue-500" size={32} />,
        educacion: <GraduationCap className="text-green-500" size={32} />,
        otros: <Star className="text-purple-500" size={32} />
    };
    return icons[category] || icons.otros;
};

const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        bodas: 'from-pink-100 to-pink-200',
        cumpleanos: 'from-orange-100 to-orange-200',
        negocios: 'from-blue-100 to-blue-200',
        educacion: 'from-green-100 to-green-200',
        otros: 'from-purple-100 to-purple-200'
    };
    return colors[category] || colors.otros;
};

const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
        bodas: 'Bodas',
        cumpleanos: 'Cumpleaños',
        negocios: 'Negocios',
        educacion: 'Educación',
        otros: 'Otros'
    };
    return labels[category] || 'General';
};

export const HomePage = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch(TEMPLATES_URL);
                if (res.ok) {
                    const data = await res.json();
                    // Sort by download count and take top 6
                    const sorted = data.sort((a: Template, b: Template) =>
                        (b.downloadCount || 0) - (a.downloadCount || 0)
                    ).slice(0, 6);
                    setTemplates(sorted);
                }
            } catch (error) {
                console.error('Error fetching templates:', error);
            }
            setLoading(false);
        };
        fetchTemplates();
    }, []);

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <motion.div
                className="bg-gradient-to-r from-primary-craft via-secondary-craft to-accent-craft p-6 md:p-12 rounded-2xl border-4 border-ink-black shadow-lg relative overflow-hidden"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="absolute top-0 right-0 opacity-20 text-8xl">🎨</div>
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-heading text-white mb-4">
                        ¡Bienvenido a <span className="font-handwriting">LoreNotes</span>! ✨
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                        Descubre plantillas creativas para bodas, cumpleaños, negocios y más.
                        ¡Haz tus proyectos únicos!
                    </p>
                    <div className="mt-6">
                        <Link to="/templates">
                            <CraftButton variant="accent" className="text-lg">
                                <Sparkles size={20} /> Explorar Plantillas
                            </CraftButton>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Featured Templates Section */}
            <motion.div
                className="bg-white/95 p-6 md:p-8 rounded-xl border-4 border-ink-black shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-heading text-ink-black flex items-center gap-2">
                        <Download className="text-primary-craft" /> Más Descargadas
                    </h2>
                    <Link to="/templates" className="text-primary-craft font-heading flex items-center gap-1 hover:underline">
                        Ver todas <ArrowRight size={18} />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-10 h-10 border-4 border-primary-craft border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-4 text-gray-500">Cargando plantillas...</p>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No hay plantillas disponibles</p>
                        <Link to="/templates" className="text-primary-craft font-heading mt-2 inline-block hover:underline">
                            Ir a Plantillas →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {templates.map((template, idx) => (
                            <motion.div
                                key={template.id}
                                className="bg-white rounded-xl border-4 border-ink-black overflow-hidden shadow-[3px_3px_0px_rgba(45,49,66,0.2)] hover:shadow-[5px_5px_0px_rgba(45,49,66,0.3)] transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                whileHover={{ y: -4 }}
                            >
                                {/* Category Icon Header */}
                                <div className={`h-24 bg-gradient-to-br ${getCategoryColor(template.category)} flex items-center justify-center relative`}>
                                    <div className="p-4 bg-white/80 rounded-full border-2 border-ink-black">
                                        {getCategoryIcon(template.category)}
                                    </div>
                                    <span className="absolute top-2 right-2 bg-ink-black text-white text-xs px-2 py-1 rounded-full">
                                        {getCategoryLabel(template.category)}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-heading font-bold text-ink-black line-clamp-1 mb-1">
                                        {template.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                        {template.description || template.purpose || 'Plantilla creativa'}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-primary-craft font-bold text-lg">
                                            ${(template.price || 0).toFixed(2)}
                                        </span>
                                        <span className="text-gray-400 text-xs flex items-center gap-1">
                                            <Download size={12} /> {template.downloadCount || 0}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Button to Templates Page */}
                <div className="mt-8 text-center">
                    <Link to="/templates">
                        <CraftButton variant="primary" className="text-lg">
                            Ver todas las plantillas <ArrowRight size={18} />
                        </CraftButton>
                    </Link>
                </div>
            </motion.div>

            {/* Categories Section */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                {[
                    { cat: 'bodas', label: 'Bodas', emoji: '💍' },
                    { cat: 'cumpleanos', label: 'Cumpleaños', emoji: '🎂' },
                    { cat: 'negocios', label: 'Negocios', emoji: '💼' },
                    { cat: 'educacion', label: 'Educación', emoji: '📚' }
                ].map((item, idx) => (
                    <Link key={item.cat} to={`/templates?cat=${item.cat}`}>
                        <motion.div
                            className={`bg-gradient-to-br ${getCategoryColor(item.cat)} p-4 md:p-6 rounded-xl border-4 border-ink-black text-center cursor-pointer`}
                            whileHover={{ scale: 1.05, rotate: -1 }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                        >
                            <span className="text-3xl md:text-4xl">{item.emoji}</span>
                            <p className="font-heading font-bold mt-2 text-ink-black">{item.label}</p>
                        </motion.div>
                    </Link>
                ))}
            </motion.div>
        </div>
    );
};
