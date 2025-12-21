// Centralized API Configuration
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('192.168');

// Production URLs (Render.com)
const PROD = {
    AUTH_URL: 'https://lorenotes-auth.onrender.com/api/auth',
    TEMPLATES_URL: 'https://lorenotes-templates.onrender.com/api/templates',
    CHATBOT_URL: 'https://lorenotes-chatbot.onrender.com/api/chat',
    BLOG_URL: 'https://lorenotes-auth.onrender.com/api/blog'
};

// Development URLs
const getDev = () => {
    const host = window.location.hostname;
    return {
        AUTH_URL: `http://${host}:4000/api/auth`,
        TEMPLATES_URL: `http://${host}:8080/api/templates`,
        CHATBOT_URL: `http://${host}:4002/api/chat`,
        BLOG_URL: `http://${host}:4000/api/blog`
    };
};

const config = isProduction ? PROD : getDev();

export const AUTH_URL = config.AUTH_URL;
export const TEMPLATES_URL = config.TEMPLATES_URL;
export const CHATBOT_URL = config.CHATBOT_URL;
export const BLOG_URL = config.BLOG_URL;

// Helper to get template image URL
export const getTemplateImageUrl = (templateId: string) => {
    return `${TEMPLATES_URL}/${templateId}/image`;
};
