const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./src/routes/authRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const { initDefaultCategories } = require('./src/controllers/categoryController');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const { sanitizeBody } = require('./src/middleware/sanitizer');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration - allow all origins for public API
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Security middlewares
app.use(generalLimiter); // Rate limiting for all routes
app.use(sanitizeBody);   // XSS protection for all request bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Auth Service' });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lorenotes-auth')
    .then(async () => {
        console.log('✅ MongoDB Connected (Auth Service)');
        // Initialize default categories
        await initDefaultCategories();
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.listen(PORT, () => {
    console.log(`🚀 Auth Service running on port ${PORT}`);

    // ===== KEEP-ALIVE SYSTEM =====
    // Ping all services every 10 minutes to prevent Render free tier from sleeping
    const SERVICES = [
        { name: 'Auth', url: 'https://lorenotes-auth.onrender.com/health' },
        { name: 'Templates', url: 'https://lorenotes-templates.onrender.com/api/templates' },
        { name: 'Chatbot', url: 'https://lorenotes-chatbot.onrender.com/health' }
    ];

    const pingServices = async () => {
        console.log('🔄 Keep-alive ping starting...');
        for (const service of SERVICES) {
            try {
                const response = await fetch(service.url);
                console.log(`✅ ${service.name}: ${response.status}`);
            } catch (error) {
                console.log(`⚠️ ${service.name}: Failed to ping`);
            }
        }
    };

    // Ping every 10 minutes (600000 ms)
    setInterval(pingServices, 10 * 60 * 1000);

    // Initial ping after 30 seconds
    setTimeout(pingServices, 30000);
    console.log('🏓 Keep-alive system activated (pings every 10 min)');
});
