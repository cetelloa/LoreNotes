import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Cake, Briefcase, GraduationCap } from 'lucide-react';
import { TEMPLATES_URL, getTemplateImageUrl } from '../config';

interface Template {
    id: string;
    title: string;
    description: string;
    purpose: string;
    price: number;
    category: string;
    imageFileId: string;
    downloadCount: number;
}

const categories = [
    { id: 'bodas', label: 'Bodas', icon: Heart },
    { id: 'cumpleanos', label: 'Cumpleaños', icon: Cake },
    { id: 'negocios', label: 'Negocios', icon: Briefcase },
    { id: 'educacion', label: 'Educación', icon: GraduationCap },
];

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
        <div className="min-h-screen">
            {/* Hero Section - Elegant */}
            <section className="py-16 md:py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h1
                        className="text-4xl md:text-6xl font-serif text-elegant-black mb-6 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Las mejores plantillas<br />
                        <span className="italic">en un solo lugar</span>
                    </motion.h1>

                    <motion.p
                        className="text-elegant-gray text-lg md:text-xl mb-10 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Descubre plantillas creativas para tus proyectos especiales
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link to="/templates">
                            <button className="bg-elegant-black text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-800 transition-all hover:shadow-lg">
                                Ver Plantillas
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 px-6 bg-cream-dark/30">
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        className="text-3xl md:text-4xl font-serif text-center mb-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        Categorías
                    </motion.h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map((cat, idx) => (
                            <Link key={cat.id} to={`/templates?cat=${cat.id}`}>
                                <motion.div
                                    className="bg-white p-8 rounded-2xl text-center hover:shadow-lg transition-all cursor-pointer group"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -4 }}
                                >
                                    <cat.icon className="mx-auto mb-4 text-elegant-gray group-hover:text-elegant-black transition-colors" size={32} strokeWidth={1.5} />
                                    <p className="font-medium text-elegant-black">{cat.label}</p>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Templates */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-serif">Más Populares</h2>
                        <Link to="/templates" className="text-elegant-gray hover:text-elegant-black flex items-center gap-1 transition-colors">
                            Ver todas <ArrowRight size={18} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-elegant-black border-t-transparent rounded-full mx-auto"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map((template, idx) => (
                                <motion.div
                                    key={template.id}
                                    className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all group"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    {/* Image */}
                                    <div className="aspect-[4/3] bg-cream-dark overflow-hidden">
                                        <img
                                            src={getTemplateImageUrl(template.imageFileId)}
                                            alt={template.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop';
                                            }}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <span className="text-xs text-elegant-light uppercase tracking-wider">
                                            {getCategoryLabel(template.category)}
                                        </span>
                                        <h3 className="font-serif text-lg text-elegant-black mt-1 line-clamp-1">
                                            {template.title}
                                        </h3>
                                        <p className="text-elegant-gray text-sm mt-2 line-clamp-2">
                                            {template.description || template.purpose || 'Plantilla creativa'}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-elegant-black font-medium">
                                                ${(template.price || 0).toFixed(2)}
                                            </span>
                                            <Link
                                                to="/templates"
                                                className="text-sm text-elegant-gray hover:text-elegant-black transition-colors"
                                            >
                                                Ver más →
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-lavender-soft/30">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-serif mb-6">
                        ¿Listo para crear algo increíble?
                    </h2>
                    <p className="text-elegant-gray mb-8">
                        Explora nuestra colección de plantillas y encuentra la perfecta para tu proyecto.
                    </p>
                    <Link to="/templates">
                        <button className="bg-elegant-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                            Explorar Plantillas
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
};
