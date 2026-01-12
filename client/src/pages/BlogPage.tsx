import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, ArrowLeft, Play } from 'lucide-react';
import { BLOG_URL } from '../config';
import { VideoEmbed } from '../components/VideoEmbed';

interface BlogPost {
    _id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    isPublished: boolean;
    videoUrl?: string;
    imageUrl?: string;
}

// Extract YouTube video ID and get thumbnail
const getYouTubeThumbnail = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
        }
    }
    return null;
};

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
                <div className="animate-spin w-8 h-8 border-2 border-elegant-black border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-elegant-gray">Cargando blog...</p>
            </div>
        );
    }

    // Single post view
    if (selectedPost) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => setSelectedPost(null)}
                    className="flex items-center gap-2 text-elegant-gray hover:text-elegant-black transition-colors mb-8"
                >
                    <ArrowLeft size={18} /> Volver al blog
                </button>

                <motion.article
                    className="bg-white rounded-2xl p-6 md:p-10 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl md:text-4xl font-serif text-elegant-black mb-4">
                        {selectedPost.title}
                    </h1>

                    <div className="flex items-center gap-4 text-elegant-gray text-sm mb-8 pb-6 border-b border-gray-100">
                        <span className="flex items-center gap-1">
                            <User size={14} /> {selectedPost.author}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar size={14} /> {formatDate(selectedPost.createdAt)}
                        </span>
                    </div>

                    {/* Video Embed */}
                    {selectedPost.videoUrl && (
                        <div className="mb-8">
                            <VideoEmbed url={selectedPost.videoUrl} title={selectedPost.title} />
                        </div>
                    )}

                    <div className="prose prose-lg max-w-none">
                        {selectedPost.content.split('\n').map((paragraph, idx) => (
                            <p key={idx} className="mb-4 text-elegant-black leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </motion.article>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-serif text-elegant-black mb-4">Blog</h1>
                <p className="text-elegant-gray">Tutoriales, consejos y novedades</p>
            </div>

            {/* Posts Grid */}
            {posts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl">
                    <p className="text-xl text-elegant-gray">No hay publicaciones todavía</p>
                    <p className="text-elegant-light mt-2">¡Pronto habrá contenido!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post, idx) => {
                        const videoThumbnail = post.videoUrl ? getYouTubeThumbnail(post.videoUrl) : null;
                        const displayImage = post.imageUrl || videoThumbnail;

                        return (
                            <motion.article
                                key={post._id}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => setSelectedPost(post)}
                            >
                                {/* Image/Video Thumbnail */}
                                <div className="h-48 bg-lavender-soft relative overflow-hidden">
                                    {displayImage ? (
                                        <img
                                            src={displayImage}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                // Fallback if thumbnail doesn't load
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-5xl opacity-30">📝</span>
                                        </div>
                                    )}
                                    {post.videoUrl && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                                                <Play size={24} className="text-elegant-black ml-1" fill="currentColor" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-serif text-lg text-elegant-black line-clamp-2 mb-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-elegant-gray text-sm line-clamp-3 mb-4">
                                        {post.content.substring(0, 150)}...
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-elegant-light">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} /> {formatDate(post.createdAt)}
                                        </span>
                                        <span className="text-elegant-black font-medium flex items-center gap-1 group-hover:underline">
                                            Leer más <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
