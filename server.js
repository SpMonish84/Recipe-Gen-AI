const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load env vars first
dotenv.config();

// Set default JWT secret if not in env
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'your-super-secret-jwt-key-123';
    console.log('Warning: Using default JWT_SECRET. Please set JWT_SECRET in .env file for production.');
}

// Set default MongoDB URI if not in env
if (!process.env.MONGO_URI) {
    process.env.MONGO_URI = 'mongodb://localhost:27017/recipe-generator';
    console.log('Warning: Using default MongoDB URI. Please set MONGO_URI in .env file for production.');
}

// Import database connection after env vars are loaded
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Set Content Security Policy header for frame-ancestors
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
    next();
});

// Serve static files with Cache-Control
const staticOptions = {
    maxAge: '1d', // Cache for 1 day
    setHeaders: (res, path, stat) => {
        // Explicitly set Cache-Control to prefer it over Expires
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 86400 seconds = 1 day
        // Remove Expires header if it was set by default static middleware
        res.removeHeader('Expires');
    }
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));
app.use(express.static(path.join(__dirname, 'src'), staticOptions));

// Routes
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'pages', 'home.html'));
});

// Middleware to remove X-Frame-Options header
app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options');
    next();
});

// Handle 404
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Start server
const server = app.listen(PORT, HOST, (err) => {
    if (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log('MongoDB Atlas Connected:', process.env.MONGO_URI);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
}); 