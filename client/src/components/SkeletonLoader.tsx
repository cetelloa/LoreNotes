import { motion } from 'framer-motion';

interface SkeletonCardProps {
    count?: number;
}

export const SkeletonCard = () => (
    <div className="bg-white rounded-xl border-4 border-ink-black overflow-hidden shadow-[4px_4px_0px_rgba(45,49,66,0.2)] animate-pulse">
        {/* Image skeleton */}
        <div className="h-40 md:h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />

        {/* Content skeleton */}
        <div className="p-4 space-y-3">
            {/* Title skeleton */}
            <div className="h-5 bg-gray-200 rounded-full w-3/4" />
            {/* Description skeleton */}
            <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded-full w-full" />
                <div className="h-3 bg-gray-100 rounded-full w-2/3" />
            </div>
            {/* Price and buttons skeleton */}
            <div className="flex items-center justify-between mt-4">
                <div className="h-6 bg-gray-200 rounded-full w-16" />
                <div className="flex gap-2">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg" />
                    <div className="h-10 w-10 bg-gray-200 rounded-lg" />
                </div>
            </div>
        </div>
    </div>
);

export const SkeletonGrid = ({ count = 6 }: SkeletonCardProps) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: count }).map((_, idx) => (
            <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
            >
                <SkeletonCard />
            </motion.div>
        ))}
    </div>
);

// Lazy loaded image component with blur placeholder
interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
}

export const LazyImage = ({ src, alt, className = '', fallbackSrc }: LazyImageProps) => {
    return (
        <img
            src={src}
            alt={alt}
            className={`${className} transition-opacity duration-300`}
            loading="lazy"
            decoding="async"
            onError={(e) => {
                if (fallbackSrc) {
                    (e.target as HTMLImageElement).src = fallbackSrc;
                }
            }}
        />
    );
};
