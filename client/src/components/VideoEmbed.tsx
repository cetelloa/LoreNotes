import { useState } from 'react';
import { Play } from 'lucide-react';

interface VideoEmbedProps {
    url: string;
    title?: string;
}

// Extract video ID from YouTube or TikTok URL
const getVideoInfo = (url: string): { type: 'youtube' | 'tiktok' | 'unknown'; id: string } => {
    // YouTube patterns
    const youtubePatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of youtubePatterns) {
        const match = url.match(pattern);
        if (match) {
            return { type: 'youtube', id: match[1] };
        }
    }

    // TikTok pattern
    const tiktokPattern = /tiktok\.com\/@[^/]+\/video\/(\d+)/;
    const tiktokMatch = url.match(tiktokPattern);
    if (tiktokMatch) {
        return { type: 'tiktok', id: tiktokMatch[1] };
    }

    return { type: 'unknown', id: '' };
};

export const VideoEmbed = ({ url, title }: VideoEmbedProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const videoInfo = getVideoInfo(url);

    if (videoInfo.type === 'unknown') {
        // If we can't parse the URL, show a link button
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-elegant-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors inline-flex"
            >
                <Play size={18} />
                Ver Video
            </a>
        );
    }

    if (videoInfo.type === 'youtube') {
        return (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-cream">
                        <div className="animate-spin w-8 h-8 border-2 border-elegant-black border-t-transparent rounded-full"></div>
                    </div>
                )}
                <iframe
                    src={`https://www.youtube.com/embed/${videoInfo.id}`}
                    title={title || 'Video'}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => setIsLoading(false)}
                />
            </div>
        );
    }

    if (videoInfo.type === 'tiktok') {
        return (
            <div className="w-full max-w-md mx-auto">
                <blockquote
                    className="tiktok-embed"
                    cite={url}
                    data-video-id={videoInfo.id}
                    style={{ maxWidth: '605px', minWidth: '325px' }}
                >
                    <section>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-elegant-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors justify-center"
                        >
                            <Play size={18} />
                            Ver en TikTok
                        </a>
                    </section>
                </blockquote>
            </div>
        );
    }

    return null;
};
