// API Service - uses centralized config
import { AUTH_URL, TEMPLATES_URL, CHATBOT_URL } from '../config';

export const API_URLS = {
    auth: AUTH_URL,
    templates: TEMPLATES_URL,
    chatbot: CHATBOT_URL,
    blog: AUTH_URL.replace('/auth', '/blog')
};

// Template API functions
export const api = {
    // Templates
    getTemplates: async () => {
        const response = await fetch(TEMPLATES_URL);
        return response.json();
    },

    getTemplateById: async (id: string) => {
        const response = await fetch(`${TEMPLATES_URL}/${id}`);
        return response.json();
    },

    // Chatbot
    sendMessage: async (message: string) => {
        const response = await fetch(CHATBOT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        return response.json();
    },

    // Auth (placeholder - handled by AuthContext)
    login: async (email: string, password: string) => {
        const response = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    }
};
