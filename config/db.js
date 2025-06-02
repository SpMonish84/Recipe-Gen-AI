const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // MongoDB Atlas specific options
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: 10,
            minPoolSize: 5,
            retryWrites: true,
            w: 'majority'
        });

        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
        
        // Handle connection errors after initial connection
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB; 