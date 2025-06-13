const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

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

// Create Express app
const app = express();

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Request headers:', req.headers);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Body parsing middleware - must be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

// Import routes
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');

// Register API routes
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'src')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend pages - handle both /pages/ and direct access
app.get(['/pages/:page', '/:page'], (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, 'src', 'pages', page);
    
    // Check if file exists
    if (require('fs').existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        // If file doesn't exist, serve home page
        res.sendFile(path.join(__dirname, 'src', 'pages', 'home.html'));
    }
});

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'pages', 'home.html'));
});

// Handle 404
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
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

// Initialize server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Connect to database and start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Verify database connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection not ready');
        }

        // Start server
        const server = app.listen(PORT, HOST, () => {
            console.log(`Server is running on http://${HOST}:${PORT}`);
            console.log('Available routes:');
            console.log('- POST /api/users/login');
            console.log('- POST /api/users/register');
            console.log('- GET /api/users/profile');
            console.log('- PUT /api/users/preferences');
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

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer(); 