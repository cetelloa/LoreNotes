// API Configuration
// Use the current hostname to connect to backend services
const getApiHost = () => {
    const hostname = window.location.hostname;
    // If accessing from mobile/external, use the same host for API
    return hostname === 'localhost' ? 'localhost' : hostname;
};

const API_HOST = getApiHost();

export const API_URLS = {
    auth: `http://${API_HOST}:4000/api/auth`,
    templates: `http://${API_HOST}:8080/api/templates`,
    chatbot: `http://${API_HOST}:4002/api/chat`
};

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
