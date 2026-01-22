import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Palette, Download, Wand2 } from 'lucide-react';
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

const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
        infografia: 'Infografía',
        lineas_tiempo: 'Líneas de tiempo',
        caratulas: 'Carátulas',
        manualidades: 'Manualidades',
        separadores: 'Separadores',
        mapas_mentales: 'Mapas mentales',
        otros: 'Otros'
    };
    return labels[category] || category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
};

const benefits = [
    { icon: Palette, title: 'Diseños Únicos', description: 'Plantillas exclusivas y creativas' },
    { icon: Download, title: 'Descarga Instantánea', description: 'Acceso inmediato a tus compras' },
    { icon: Wand2, title: 'Fácil de Editar', description: 'Personaliza a tu gusto' },
];

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
                    ).slice(0, 3);
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
            {/* Hero Section - Split Layout */}
            <section className="py-12 md:py-20 px-6">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    {/* Left - Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-elegant-black mb-6 leading-tight">
                            Las mejores plantillas
                            <br />
                            <span className="italic text-elegant-gray">en un solo lugar</span>
                        </h1>

                        <p className="text-elegant-gray text-lg mb-8 max-w-md">
                            Encuentra inspiración y herramientas creativas premium para tus proyectos especiales.
                        </p>

                        <Link to="/templates">
                            <motion.button
                                className="bg-elegant-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all hover:shadow-xl"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Ver Todas las Plantillas
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Right - Floating Templates Collage */}
                    <motion.div
                        className="relative h-[400px] md:h-[450px]"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {templates.slice(0, 3).map((template, idx) => (
                            <motion.div
                                key={template.id}
                                className="absolute rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
                                style={{
                                    width: idx === 0 ? '70%' : '55%',
                                    height: idx === 0 ? '85%' : '70%',
                                    top: idx === 0 ? '5%' : idx === 1 ? '15%' : '25%',
                                    left: idx === 0 ? '25%' : idx === 1 ? '0' : '40%',
                                    zIndex: idx === 0 ? 3 : idx === 1 ? 2 : 1,
                                    rotate: idx === 0 ? 3 : idx === 1 ? -5 : 8,
                                }}
                                whileHover={{ scale: 1.05, zIndex: 10, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <img
                                    src={getTemplateImageUrl(template.id)}
                                    alt={template.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-158628138034${idx}-632531db7ed4?w=400&h=500&fit=crop`;
                                    }}
                                />
                            </motion.div>
                        ))}
                        {/* Decorative elements */}
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-pink-200/50 rounded-full blur-2xl" />
                        <div className="absolute -top-4 -right-4 w-32 h-32 bg-purple-200/50 rounded-full blur-2xl" />
                    </motion.div>
                </div>
            </section>

            {/* Featured Templates */}
            <section className="py-16 px-6 bg-white/50">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-serif text-elegant-black">
                            Plantillas Destacadas
                        </h2>
                        <Link
                            to="/templates"
                            className="text-elegant-gray hover:text-elegant-black flex items-center gap-1 transition-colors group"
                        >
                            Ver todas
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-cream-dark/50 rounded-2xl h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {templates.map((template, idx) => (
                                <Link key={template.id} to={`/templates#${template.id}`}>
                                    <motion.div
                                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all group cursor-pointer"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ y: -8 }}
                                    >
                                        {/* Large Image */}
                                        <div className="aspect-[3/4] bg-cream-dark overflow-hidden">
                                            <img
                                                src={getTemplateImageUrl(template.id)}
                                                alt={template.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=600&fit=crop';
                                                }}
                                            />
                                        </div>

                                        {/* Minimal Content */}
                                        <div className="p-5">
                                            <span className="text-xs text-elegant-light uppercase tracking-wider">
                                                {getCategoryLabel(template.category)}
                                            </span>
                                            <h3 className="font-serif text-lg text-elegant-black mt-1 line-clamp-1">
                                                {template.title}
                                            </h3>
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="text-elegant-black font-semibold text-lg">
                                                    ${(template.price || 0).toFixed(2)}
                                                </span>
                                                <span className="text-sm text-elegant-gray group-hover:text-elegant-black transition-colors flex items-center gap-1">
                                                    Ver detalles <ArrowRight size={14} />
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.h2
                        className="text-2xl md:text-3xl font-serif text-center mb-12 text-elegant-black"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        ¿Por qué LoreNotes?
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {benefits.map((benefit, idx) => (
                            <motion.div
                                key={benefit.title}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="w-16 h-16 mx-auto mb-4 bg-cream rounded-2xl flex items-center justify-center">
                                    <benefit.icon size={28} className="text-elegant-gray" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-medium text-elegant-black mb-2">{benefit.title}</h3>
                                <p className="text-elegant-gray text-sm">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-6 bg-elegant-black text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.h2
                        className="text-2xl md:text-3xl font-serif mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        ¿Listo para crear algo increíble?
                    </motion.h2>
                    <motion.p
                        className="text-gray-300 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        Explora nuestra colección de plantillas y encuentra la perfecta para tu proyecto.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link to="/templates">
                            <button className="bg-white text-elegant-black px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors">
                                Explorar Plantillas
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
