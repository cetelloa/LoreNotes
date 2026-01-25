const rateLimit = require('express-rate-limit');

// General API rate limiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { message: 'Demasiadas solicitudes, intenta de nuevo más tarde' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for auth endpoints (login, register, etc.)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 auth requests per windowMs
    message: { message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Very strict limiter for password reset (prevent email spam)
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: { message: 'Demasiadas solicitudes de restablecimiento, intenta de nuevo en 1 hora' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Reviews rate limiter (prevent spam)
const reviewsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 review operations per hour
    message: { message: 'Demasiadas operaciones de reviews, intenta de nuevo más tarde' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    reviewsLimiter
};
