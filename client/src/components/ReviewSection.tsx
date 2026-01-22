import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Trash2, Edit3 } from 'lucide-react';
import { AUTH_URL } from '../config';
import { useAuth } from '../context/AuthContext';

interface Review {
    _id: string;
    templateId: string;
    userId: string;
    username: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface ReviewSectionProps {
    templateId: string;
    hasPurchased: boolean;
}

export const ReviewSection = ({ templateId, hasPurchased }: ReviewSectionProps) => {
    const { token, isAuthenticated, user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [myReview, setMyReview] = useState<Review | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });

    // Form state
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadReviews();
        loadStats();
        if (isAuthenticated) loadMyReview();
    }, [templateId, isAuthenticated]);

    const loadReviews = async () => {
        try {
            const res = await fetch(`${AUTH_URL}/reviews/${templateId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const res = await fetch(`${AUTH_URL}/reviews/stats/${templateId}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const loadMyReview = async () => {
        try {
            const res = await fetch(`${AUTH_URL}/reviews/mine/${templateId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.review) {
                    setMyReview(data.review);
                    setRating(data.review.rating);
                    setComment(data.review.comment);
                }
            }
        } catch (error) {
            console.error('Error loading my review:', error);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${AUTH_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ templateId, rating, comment })
            });
            if (res.ok) {
                await loadReviews();
                await loadStats();
                await loadMyReview();
                setIsEditing(false);
            } else {
                const data = await res.json();
                alert(data.message || 'Error al guardar review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Eliminar tu review?')) return;
        try {
            const res = await fetch(`${AUTH_URL}/reviews/${templateId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMyReview(null);
                setRating(0);
                setComment('');
                await loadReviews();
                await loadStats();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const StarRating = ({ value, interactive = false, size = 20 }: { value: number; interactive?: boolean; size?: number }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={`transition-colors cursor-${interactive ? 'pointer' : 'default'} ${star <= (interactive ? (hoverRating || rating) : value)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    onMouseEnter={() => interactive && setHoverRating(star)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                    onClick={() => interactive && setRating(star)}
                />
            ))}
        </div>
    );

    return (
        <div className="mt-6 border-t border-pastel-lavender pt-6">
            {/* Stats Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <StarRating value={Math.round(stats.averageRating)} size={24} />
                    <span className="text-xl font-bold text-elegant-black">{stats.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-elegant-gray">({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})</span>
            </div>

            {/* Write Review Form */}
            {isAuthenticated && hasPurchased && (!myReview || isEditing) && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-pastel-lavender/20 rounded-xl p-4 mb-6"
                >
                    <h4 className="font-medium text-elegant-black mb-3">
                        {myReview ? 'Editar tu review' : 'Deja tu review'}
                    </h4>
                    <div className="mb-3">
                        <StarRating value={rating} interactive size={28} />
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Cuéntanos tu experiencia con esta plantilla (opcional)"
                        className="w-full p-3 rounded-lg border border-pastel-lavender focus:outline-none focus:ring-2 focus:ring-pastel-purple/30 resize-none"
                        rows={3}
                        maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-elegant-light">{comment.length}/500</span>
                        <div className="flex gap-2">
                            {isEditing && (
                                <button
                                    onClick={() => { setIsEditing(false); setRating(myReview!.rating); setComment(myReview!.comment); }}
                                    className="px-4 py-2 text-elegant-gray hover:text-elegant-black"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={rating === 0 || submitting}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pastel-purple to-pastel-pink text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                <Send size={16} />
                                {submitting ? 'Guardando...' : 'Publicar'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* My Review Display */}
            {myReview && !isEditing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-pastel-pink/10 border border-pastel-pink/30 rounded-xl p-4 mb-6"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-elegant-black">Tu review</span>
                                <StarRating value={myReview.rating} size={16} />
                            </div>
                            {myReview.comment && (
                                <p className="text-elegant-gray text-sm">{myReview.comment}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditing(true)} className="p-2 text-elegant-gray hover:text-pastel-purple">
                                <Edit3 size={16} />
                            </button>
                            <button onClick={handleDelete} className="p-2 text-elegant-gray hover:text-red-500">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Not purchased message */}
            {isAuthenticated && !hasPurchased && (
                <p className="text-sm text-elegant-gray bg-cream-dark/50 rounded-lg p-3 mb-6">
                    💡 Compra esta plantilla para poder dejar un review
                </p>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2].map(i => <div key={i} className="h-20 bg-cream-dark rounded-lg" />)}
                    </div>
                ) : reviews.length === 0 ? (
                    <p className="text-center text-elegant-gray py-8">Aún no hay reviews. ¡Sé el primero!</p>
                ) : (
                    <AnimatePresence>
                        {reviews.filter(r => r.userId !== (user as any)?._id).map((review) => (
                            <motion.div
                                key={review._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 p-3 bg-white rounded-lg border border-pastel-lavender/30"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pastel-purple to-pastel-pink flex items-center justify-center text-white font-bold">
                                    {review.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-elegant-black">{review.username}</span>
                                        <StarRating value={review.rating} size={14} />
                                        <span className="text-xs text-elegant-light">
                                            {new Date(review.createdAt).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                    {review.comment && (
                                        <p className="text-elegant-gray text-sm">{review.comment}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
