import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

interface VideoEmbedProps {
    url: string;
    title?: string;
}

type VideoType = 'youtube' | 'tiktok' | 'instagram' | 'unknown';

// Extract video info from URL
const getVideoInfo = (url: string): { type: VideoType; id: string; fullUrl: string } => {
    // YouTube patterns
    const youtubePatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of youtubePatterns) {
        const match = url.match(pattern);
        if (match) {
            return { type: 'youtube', id: match[1], fullUrl: url };
        }
    }

    // TikTok pattern - matches various TikTok URL formats
    const tiktokPatterns = [
        /tiktok\.com\/@[^/]+\/video\/(\d+)/,
        /tiktok\.com\/t\/([a-zA-Z0-9]+)/,
        /vm\.tiktok\.com\/([a-zA-Z0-9]+)/
    ];

    for (const pattern of tiktokPatterns) {
        const match = url.match(pattern);
        if (match) {
            return { type: 'tiktok', id: match[1], fullUrl: url };
        }
    }

    // Instagram Reels/Posts pattern
    const instagramPatterns = [
        /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
        /instagram\.com\/p\/([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of instagramPatterns) {
        const match = url.match(pattern);
        if (match) {
            return { type: 'instagram', id: match[1], fullUrl: url };
        }
    }

    return { type: 'unknown', id: '', fullUrl: url };
};

// Load external script dynamically
const loadScript = (src: string, id: string): Promise<void> => {
    return new Promise((resolve) => {
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
    });
};

export const VideoEmbed = ({ url, title }: VideoEmbedProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const videoInfo = getVideoInfo(url);

    // Load TikTok or Instagram embed script
    useEffect(() => {
        if (videoInfo.type === 'tiktok') {
            loadScript('https://www.tiktok.com/embed.js', 'tiktok-embed-script')
                .then(() => setScriptLoaded(true));
        } else if (videoInfo.type === 'instagram') {
            loadScript('https://www.instagram.com/embed.js', 'instagram-embed-script')
                .then(() => {
                    setScriptLoaded(true);
                    // Instagram requires processing embeds after script loads
                    if ((window as any).instgrm) {
                        (window as any).instgrm.Embeds.process();
                    }
                });
        }
    }, [videoInfo.type]);

    // Process Instagram embeds when component mounts
    useEffect(() => {
        if (videoInfo.type === 'instagram' && scriptLoaded) {
            setTimeout(() => {
                if ((window as any).instgrm) {
                    (window as any).instgrm.Embeds.process();
                }
            }, 100);
        }
    }, [scriptLoaded, videoInfo.type]);

    // Unknown type - show link button
    if (videoInfo.type === 'unknown') {
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

    // YouTube embed
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

    // TikTok embed
    if (videoInfo.type === 'tiktok') {
        return (
            <div className="w-full flex justify-center">
                <blockquote
                    className="tiktok-embed"
                    cite={videoInfo.fullUrl}
                    data-video-id={videoInfo.id}
                    style={{ maxWidth: '605px', minWidth: '300px' }}
                >
                    <section>
                        {!scriptLoaded && (
                            <div className="flex items-center justify-center p-8 bg-cream rounded-xl">
                                <div className="animate-spin w-8 h-8 border-2 border-elegant-black border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </section>
                </blockquote>
            </div>
        );
    }

    // Instagram embed
    if (videoInfo.type === 'instagram') {
        return (
            <div className="w-full flex justify-center">
                <blockquote
                    className="instagram-media"
                    data-instgrm-captioned
                    data-instgrm-permalink={`https://www.instagram.com/reel/${videoInfo.id}/`}
                    data-instgrm-version="14"
                    style={{
                        background: '#FFF',
                        border: 0,
                        borderRadius: '12px',
                        boxShadow: '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
                        margin: '1px',
                        maxWidth: '540px',
                        minWidth: '300px',
                        padding: 0,
                        width: '100%'
                    }}
                >
                    {!scriptLoaded && (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin w-8 h-8 border-2 border-elegant-black border-t-transparent rounded-full"></div>
                        </div>
                    )}
                </blockquote>
            </div>
        );
    }

    return null;
};
