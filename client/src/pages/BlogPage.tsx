import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { BLOG_URL } from '../config';

interface BlogPost {
    _id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    isPublished: boolean;
}

export const BlogPage = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch(BLOG_URL);
            if (res.ok) {
                const data = await res.json();
                setPosts(data.filter((p: BlogPost) => p.isPublished));
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
        setLoading(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-primary-craft border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-500">Cargando blog...</p>
            </div>
        );
    }

    // Single post view
    if (selectedPost) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedPost(null)}
                    className="text-primary-craft font-heading flex items-center gap-1 hover:underline"
                >
                    ← Volver al blog
                </button>

                <motion.article
                    className="bg-white/95 p-6 md:p-10 rounded-xl border-4 border-ink-black shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl md:text-4xl font-heading text-ink-black mb-4">{selectedPost.title}</h1>

                    <div className="flex items-center gap-4 text-gray-500 text-sm mb-6 border-b pb-4">
                        <span className="flex items-center gap-1"><User size={14} /> {selectedPost.author}</span>
                        <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(selectedPost.createdAt)}</span>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        {selectedPost.content.split('\n').map((paragraph, idx) => (
                            <p key={idx} className="mb-4 text-ink-black leading-relaxed">{paragraph}</p>
                        ))}
                    </div>
                </motion.article>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                className="bg-gradient-to-r from-craft-purple to-craft-blue p-4 md:p-6 rounded-xl border-4 border-ink-black"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl md:text-4xl font-heading text-white">Blog Creativo 📝</h1>
                <p className="text-white/80 text-sm md:text-base">Tutoriales, consejos y novedades de diseño</p>
            </motion.div>

            {/* Posts Grid */}
            {posts.length === 0 ? (
                <div className="text-center py-12 bg-white/90 rounded-xl border-4 border-ink-black">
                    <p className="text-xl text-gray-500">No hay publicaciones todavía 📭</p>
                    <p className="text-gray-400 mt-2">¡Pronto habrá contenido creativo!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {posts.map((post, idx) => (
                        <motion.article
                            key={post._id}
                            className="bg-white rounded-xl border-4 border-ink-black overflow-hidden shadow-[4px_4px_0px_rgba(45,49,66,0.2)] hover:shadow-[6px_6px_0px_rgba(45,49,66,0.3)] transition-all cursor-pointer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedPost(post)}
                        >
                            {/* Decorative Header */}
                            <div className="h-24 md:h-32 bg-gradient-to-br from-accent-craft via-secondary-craft to-primary-craft relative">
                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                    <span className="text-6xl">✏️</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-heading font-bold text-lg text-ink-black line-clamp-2 mb-2">
                                    {post.title}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                                    {post.content.substring(0, 150)}...
                                </p>

                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} /> {formatDate(post.createdAt)}
                                    </span>
                                    <span className="text-primary-craft font-heading flex items-center gap-1">
                                        Leer más <ArrowRight size={12} />
                                    </span>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            )}
        </div>
    );
};
