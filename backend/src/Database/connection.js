const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;
        if (!mongoUrl) {
            throw new Error("MONGODB_URI or MONGO_URL not found in environment variables");
        }

        await mongoose.connect(mongoUrl);
        console.log(`MongoDB connected successfully ${mongoose.connection.host}`);
    } catch (err) {
        console.error(`MongoDB connection failed: ${err.message}`);
        // In production/serverless, we shouldn't necessarily exit the process
        // instead let the error propagate or handled by the app
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
}

module.exports = connectDB;