// Centralized API Configuration using Vite environment variables
// In production (Vercel), these come from .env.production
// In development, they fall back to local URLs

const getHostname = () => {
    if (typeof window !== 'undefined') {
        return window.location.hostname;
    }
    return 'localhost';
};

const hostname = getHostname();

// Use Vite env vars if available, otherwise use development defaults
export const AUTH_URL = import.meta.env.VITE_AUTH_URL || `http://${hostname}:4000/api/auth`;
export const TEMPLATES_URL = import.meta.env.VITE_TEMPLATES_URL || `http://${hostname}:8080/api/templates`;
export const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || `http://${hostname}:4002/api/chat`;
export const BLOG_URL = import.meta.env.VITE_BLOG_URL || `http://${hostname}:4000/api/blog`;

// Debug logging
console.log('API Configuration:', {
    AUTH_URL,
    TEMPLATES_URL,
    CHATBOT_URL,
    BLOG_URL
});

// Helper to get template image URL
export const getTemplateImageUrl = (templateId: string) => {
    return `${TEMPLATES_URL}/${templateId}/image`;
};
