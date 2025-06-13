const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        // Close any existing connections
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
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
            // Attempt to reconnect
            setTimeout(connectDB, 5000);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            // Attempt to reconnect
            setTimeout(connectDB, 5000);
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error during MongoDB connection closure:', err);
                process.exit(1);
            }
        });

        return conn;
    } catch (error) {
        console.error('Database connection error:', error.message);
        // Attempt to reconnect
        setTimeout(connectDB, 5000);
        throw error;
    }
};

module.exports = connectDB; 