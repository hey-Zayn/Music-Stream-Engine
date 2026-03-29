const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;
        if (!mongoUrl) {
            throw new Error("MONGODB_URI or MONGO_URL not found in environment variables");
        }

        await mongoose.connect(mongoUrl, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        
        isConnected = true;
        console.log(`MongoDB connected successfully ${mongoose.connection.host}`);
    } catch (err) {
        console.error(`MongoDB connection failed: ${err.message}`);
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
}

module.exports = connectDB;