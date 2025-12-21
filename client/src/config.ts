// Centralized API Configuration
// Check for production: Vercel, or any non-localhost/non-local-IP domain
const hostname = window.location.hostname;
const isProduction =
    hostname.includes('vercel.app') ||
    hostname.includes('netlify.app') ||
    hostname.includes('.com') ||
    hostname.includes('.io') ||
    (hostname !== 'localhost' &&
        !hostname.includes('192.168') &&
        !hostname.includes('127.0.0.1') &&
        !hostname.match(/^\d+\.\d+\.\d+\.\d+$/));

// Production URLs (Render.com) - ALWAYS use HTTPS
const PROD = {
    AUTH_URL: 'https://lorenotes-auth.onrender.com/api/auth',
    TEMPLATES_URL: 'https://lorenotes-templates.onrender.com/api/templates',
    CHATBOT_URL: 'https://lorenotes-chatbot.onrender.com/api/chat',
    BLOG_URL: 'https://lorenotes-auth.onrender.com/api/blog'
};

// Development URLs (local Docker)
const DEV = {
    AUTH_URL: `http://${hostname}:4000/api/auth`,
    TEMPLATES_URL: `http://${hostname}:8080/api/templates`,
    CHATBOT_URL: `http://${hostname}:4002/api/chat`,
    BLOG_URL: `http://${hostname}:4000/api/blog`
};

// Force production for debugging - uncomment if needed
// const config = PROD;
const config = isProduction ? PROD : DEV;

console.log('Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('AUTH_URL:', config.AUTH_URL);

export const AUTH_URL = config.AUTH_URL;
export const TEMPLATES_URL = config.TEMPLATES_URL;
export const CHATBOT_URL = config.CHATBOT_URL;
export const BLOG_URL = config.BLOG_URL;

// Helper to get template image URL
export const getTemplateImageUrl = (templateId: string) => {
    return `${TEMPLATES_URL}/${templateId}/image`;
};
