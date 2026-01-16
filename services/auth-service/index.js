const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./src/routes/authRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const { initDefaultCategories } = require('./src/controllers/categoryController');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration - allow all origins for public API
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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
});
