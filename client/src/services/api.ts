// API Configuration for Production (Render) and Development
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('192.168');

// Production URLs (Render.com)
const PROD_URLS = {
    auth: 'https://lorenotes-auth.onrender.com/api/auth',
    templates: 'https://lorenotes-templates.onrender.com/api/templates',
    chatbot: 'https://lorenotes-chatbot.onrender.com/api/chat',
    blog: 'https://lorenotes-auth.onrender.com/api/blog'
};

// Development URLs (local)
const getDevUrls = () => {
    const host = window.location.hostname;
    return {
        auth: `http://${host}:4000/api/auth`,
        templates: `http://${host}:8080/api/templates`,
        chatbot: `http://${host}:4002/api/chat`,
        blog: `http://${host}:4000/api/blog`
    };
};

export const API_URLS = isProduction ? PROD_URLS : getDevUrls();

// Template API functions
export const api = {
    // Templates
    getTemplates: async () => {
        const response = await fetch(API_URLS.templates);
        return response.json();
    },

    getTemplateById: async (id: string) => {
        const response = await fetch(`${API_URLS.templates}/${id}`);
        return response.json();
    },

    // Chatbot
    sendMessage: async (message: string) => {
        const response = await fetch(API_URLS.chatbot, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        return response.json();
    },

    // Auth (placeholder - handled by AuthContext)
    login: async (email: string, password: string) => {
        const response = await fetch(`${API_URLS.auth}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    }
};
