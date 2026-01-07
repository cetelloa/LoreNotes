const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// In-memory conversation history (per session, simplified)
const conversationHistory = new Map();

// Template Schema
const templateSchema = new mongoose.Schema({
    title: String,
    description: String,
    purpose: String,
    price: Number,
    author: String,
    category: String,
    tags: [String],
    imageFileId: String,
    templateFileId: String,
    fileName: String,
    fileFormat: String,
    isActive: Boolean
}, { collection: 'templates' });

const Template = mongoose.model('Template', templateSchema);

// Intelligent Search Function
const searchTemplates = async (query) => {
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    if (words.length === 0) {
        return await Template.find({ isActive: true }).limit(5);
    }

    const results = await Template.find({
        isActive: true,
        $or: words.flatMap(word => [
            { title: { $regex: word, $options: 'i' } },
            { description: { $regex: word, $options: 'i' } },
            { purpose: { $regex: word, $options: 'i' } },
            { category: { $regex: word, $options: 'i' } },
            { tags: { $regex: word, $options: 'i' } }
        ])
    }).limit(10);

    return results;
};

// Format templates for AI context
const formatTemplatesForAI = (templates) => {
    if (templates.length === 0) return "No se encontraron plantillas relacionadas.";

    return templates.map((t, i) =>
        `${i + 1}. "${t.title}" - Categoría: ${t.category || 'General'}, Precio: $${(t.price || 0).toFixed(2)}, Descripción: ${t.description || 'Sin descripción'}`
    ).join('\n');
};

// Format conversation history for context
const formatHistory = (history) => {
    if (!history || history.length === 0) return "";

    return history.slice(-6).map(msg =>
        `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
    ).join('\n');
};

// Generate response with Gemini AI and conversation context
const generateAIResponse = async (userMessage, templates, history) => {
    const templateContext = formatTemplatesForAI(templates);
    const historyContext = formatHistory(history);

    const prompt = `Eres "LoreBot", un asistente virtual amigable para LoreNotes, una tienda de plantillas de diseño creativo.

PERSONALIDAD:
- Eres alegre, amable y conversacional 🎨
- Respondes naturalmente a saludos, preguntas casuales y conversación general
- Usas emojis con moderación para ser cálido
- Si te preguntan cosas personales (nombre, cómo estás, etc), responde de forma amigable
- Puedes responder preguntas generales de cultura, consejos, o simplemente chatear

${historyContext ? `HISTORIAL DE CONVERSACIÓN:\n${historyContext}\n` : ''}

${templates.length > 0 ? `PLANTILLAS ENCONTRADAS:\n${templateContext}\n` : ''}

MENSAJE ACTUAL: "${userMessage}"

INSTRUCCIONES:
1. PRIMERO: Responde naturalmente al mensaje del usuario (si es saludo, chiste, pregunta general, etc)
2. Si el usuario pregunta ESPECÍFICAMENTE sobre plantillas o diseño, recomienda de las encontradas
3. Si no es sobre plantillas, simplemente conversa normalmente y al final puedes mencionar que ayudas con diseños
4. Respuestas CORTAS (1-3 oraciones máximo)
5. NO repitas saludos si ya hubo conversación
6. Sé natural, como un amigo que trabaja en una tienda de diseño`;


    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API error:', error);
        if (templates.length > 0) {
            return `¡Tengo ${templates.length} opción${templates.length > 1 ? 'es' : ''} para ti! 🎨 "${templates[0].title}" por $${templates[0].price?.toFixed(2) || '0.00'} podría interesarte.`;
        }
        return "¡Ups! Tuve un pequeño problema. ¿Puedes reformular tu pregunta? 😊";
    }
};

// Chat Endpoint with conversation history
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;

        // Get or create conversation history
        if (!conversationHistory.has(sessionId)) {
            conversationHistory.set(sessionId, []);
        }
        const history = conversationHistory.get(sessionId);

        if (!message || message.trim().length === 0) {
            const greeting = history.length === 0
                ? "¡Hola! Soy LoreBot 🎨 ¿Buscas plantillas para un proyecto especial? Cuéntame qué tienes en mente."
                : "¿En qué más puedo ayudarte? 😊";
            return res.json({ response: greeting, templates: [] });
        }

        // Add user message to history
        history.push({ role: 'user', content: message });

        // Search templates
        const templates = await searchTemplates(message);

        // Generate AI response with context
        const response = await generateAIResponse(message, templates, history);

        // Add AI response to history
        history.push({ role: 'ai', content: response });

        // Keep history manageable (last 20 messages)
        if (history.length > 20) {
            history.splice(0, history.length - 20);
        }

        res.json({
            response,
            templates: templates.map(t => ({
                id: t._id,
                title: t.title,
                category: t.category,
                price: t.price,
                purpose: t.purpose,
                imageFileId: t.imageFileId
            })),
            source: 'LoreBot (Gemini AI)'
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            response: "¡Ups! Hubo un problema. ¿Intentamos de nuevo? 😅",
            templates: []
        });
    }
});

// Clear conversation history
app.post('/api/chat/clear', (req, res) => {
    const { sessionId = 'default' } = req.body;
    conversationHistory.delete(sessionId);
    res.json({ message: 'Conversación reiniciada' });
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'AI Chatbot Service',
        ai: 'Gemini 1.5 Flash',
        features: ['conversation-memory', 'template-search']
    });
});

// Connect to MongoDB and start server
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/lorenotes-templates';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected (Chatbot Service)');
        app.listen(PORT, () => {
            console.log(`🤖 AI Chatbot Service running on port ${PORT}`);
            console.log(`🧠 Powered by Google Gemini AI with conversation memory`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        app.listen(PORT, () => {
            console.log(`🤖 AI Chatbot Service running on port ${PORT} (No DB)`);
        });
    });
