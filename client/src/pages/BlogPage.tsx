import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, ArrowLeft, Play, Send, MessageCircle } from 'lucide-react';
import { BLOG_URL } from '../config';
import { VideoEmbed } from '../components/VideoEmbed';
import { useAuth } from '../context/AuthContext';

interface Reply {
    _id: string;
    userId: string;
    username: string;
    avatarUrl?: string;
    content: string;
    isAdmin: boolean;
    createdAt: string;
}

interface Comment {
    _id: string;
    userId: string;
    username: string;
    avatarUrl?: string;
    content: string;
    replies: Reply[];
    createdAt: string;
}

interface BlogPost {
    _id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    isPublished: boolean;
    videoUrl?: string;
    imageUrl?: string;
    comments?: Comment[];
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

// Check if URL is a TikTok video
const isTikTokUrl = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('tiktok.com') || url.includes('vm.tiktok');
};

// Check if URL is an Instagram video/reel
const isInstagramUrl = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('instagram.com/reel') || url.includes('instagram.com/p/');
};

// Check if avatar is base64 image
const isImageAvatar = (url?: string) => url?.startsWith('data:image');

export const BlogPage = () => {
    const { isAuthenticated, isAdmin, user, token } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    // Comment state
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    // Polling for real-time updates
    useEffect(() => {
        if (!selectedPost) return;

        const interval = setInterval(() => {
            fetchPost(selectedPost._id);
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [selectedPost?._id]);

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

    const fetchPost = async (postId: string) => {
        try {
            const res = await fetch(`${BLOG_URL}/${postId}`);
            if (res.ok) {
                const post = await res.json();
                setSelectedPost(post);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !selectedPost) return;

        setCommentLoading(true);
        try {
            const res = await fetch(`${BLOG_URL}/${selectedPost._id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                setNewComment('');
                fetchPost(selectedPost._id); // Refresh post to get new comment
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
        setCommentLoading(false);
    };

    const handleAddReply = async (commentId: string) => {
        if (!replyContent.trim() || !selectedPost) return;

        setCommentLoading(true);
        try {
            const res = await fetch(`${BLOG_URL}/${selectedPost._id}/comments/${commentId}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: replyContent })
            });

            if (res.ok) {
                setReplyContent('');
                setReplyingTo(null);
                fetchPost(selectedPost._id); // Refresh
            }
        } catch (error) {
            console.error('Error adding reply:', error);
        }
        setCommentLoading(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `hace ${days}d`;
        if (hours > 0) return `hace ${hours}h`;
        return 'ahora';
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-elegant-black border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-elegant-gray">Cargando blog...</p>
            </div>
        );
    }

    // Single post view with comments
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
                    className="bg-white rounded-2xl p-6 md:p-10 shadow-lg mb-6"
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

                {/* Comments Section */}
                <motion.div
                    className="bg-white rounded-2xl p-6 md:p-8 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-xl font-serif text-elegant-black mb-6 flex items-center gap-2">
                        <MessageCircle size={20} />
                        Comentarios ({selectedPost.comments?.length || 0})
                    </h2>

                    {/* Comment Form */}
                    {isAuthenticated ? (
                        <div className="mb-6">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-lavender-soft flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {isImageAvatar(user?.avatarUrl) ? (
                                        <img src={user?.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg">{user?.avatarUrl || '👤'}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Escribe un comentario..."
                                        className="w-full p-3 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20 resize-none"
                                        rows={3}
                                        maxLength={1000}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={handleAddComment}
                                            disabled={commentLoading || !newComment.trim()}
                                            className="flex items-center gap-2 bg-elegant-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            <Send size={14} /> Comentar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-cream rounded-xl text-center">
                            <p className="text-elegant-gray">
                                <a href="/login" className="text-elegant-black font-medium underline">Inicia sesión</a> para comentar
                            </p>
                        </div>
                    )}

                    {/* Comments List */}
                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                        <div className="space-y-6">
                            {selectedPost.comments.map((comment) => (
                                <div key={comment._id} className="border-b border-gray-100 pb-6 last:border-0">
                                    {/* Comment */}
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-lavender-soft flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {isImageAvatar(comment.avatarUrl) ? (
                                                <img src={comment.avatarUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg">{comment.avatarUrl || '👤'}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-elegant-black">{comment.username}</span>
                                                <span className="text-xs text-elegant-light">{formatTimeAgo(comment.createdAt)}</span>
                                            </div>
                                            <p className="text-elegant-gray">{comment.content}</p>

                                            {/* Admin Reply Button */}
                                            {isAdmin && (
                                                <button
                                                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                                    className="text-xs text-elegant-gray hover:text-elegant-black mt-2"
                                                >
                                                    Responder
                                                </button>
                                            )}

                                            {/* Reply Form (Admin only) */}
                                            {isAdmin && replyingTo === comment._id && (
                                                <div className="mt-3 pl-4 border-l-2 border-lavender-soft">
                                                    <textarea
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        placeholder="Escribe una respuesta..."
                                                        className="w-full p-2 bg-cream rounded-lg text-sm text-elegant-black focus:outline-none resize-none"
                                                        rows={2}
                                                    />
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleAddReply(comment._id)}
                                                            disabled={commentLoading}
                                                            className="bg-elegant-black text-white px-3 py-1 rounded-full text-xs"
                                                        >
                                                            Enviar
                                                        </button>
                                                        <button
                                                            onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                                                            className="text-xs text-elegant-gray"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Replies */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="mt-4 space-y-3">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply._id} className="flex gap-3 pl-4 border-l-2 border-lavender-soft">
                                                            <div className="w-8 h-8 rounded-full bg-lavender-soft flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {isImageAvatar(reply.avatarUrl) ? (
                                                                    <img src={reply.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-sm">{reply.avatarUrl || '👤'}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-medium text-elegant-black text-sm">{reply.username}</span>
                                                                    {reply.isAdmin && (
                                                                        <span className="text-xs bg-elegant-black text-white px-2 py-0.5 rounded-full">Admin</span>
                                                                    )}
                                                                    <span className="text-xs text-elegant-light">{formatTimeAgo(reply.createdAt)}</span>
                                                                </div>
                                                                <p className="text-elegant-gray text-sm">{reply.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <MessageCircle size={32} className="mx-auto text-elegant-light mb-2" />
                            <p className="text-elegant-gray">No hay comentarios aún. ¡Sé el primero!</p>
                        </div>
                    )}
                </motion.div>
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
                                onClick={() => fetchPost(post._id)}
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
                                    ) : isTikTokUrl(post.videoUrl) ? (
                                        // TikTok placeholder with gradient and icon
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00f2ea] via-[#ff0050] to-[#00f2ea]">
                                            <div className="text-center">
                                                <svg viewBox="0 0 24 24" className="w-16 h-16 mx-auto text-white" fill="currentColor">
                                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                                </svg>
                                                <span className="text-white text-xs font-medium mt-2 block">TikTok</span>
                                            </div>
                                        </div>
                                    ) : isInstagramUrl(post.videoUrl) ? (
                                        // Instagram placeholder with gradient and icon
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]">
                                            <div className="text-center">
                                                <svg viewBox="0 0 24 24" className="w-16 h-16 mx-auto text-white" fill="currentColor">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                </svg>
                                                <span className="text-white text-xs font-medium mt-2 block">Instagram</span>
                                            </div>
                                        </div>
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
