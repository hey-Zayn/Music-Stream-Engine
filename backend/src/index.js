const express = require('express');
const cors = require('cors');
const connectDB = require('./Database/connection');
const dotenv = require('dotenv').config();
const { clerkMiddleware } = require("@clerk/express")
const fileUpload = require("express-fileupload")
const path = require("path");
const { createServer } = require('http');
const { initializeSocket } = require('./lib/socket');
const Sentry = require("@sentry/node");
require("./instrument.js");
const Logger = require("./lib/logger");

const app = express();

// 1. CORS FIRST!
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://musicshoot.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// 2. Body Parser & Middleware
app.use(express.json());
app.use(clerkMiddleware());

const projectRoot = path.resolve();
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: path.join(projectRoot, "tmp"),
        createParentPath: true,
        limits: { fileSize: 50 * 1024 * 1024 },
    })
);

// 3. Socket.io
const httpServer = createServer(app);
initializeSocket(httpServer);

// 4. Routes
app.use('/api/users', require('./routes/user.route'));
app.use('/api/messages', require('./routes/message.route'));
app.use('/api/notifications', require('./routes/notification.route'));
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/songs', require('./routes/songs.route'));
app.use('/api/admin', require('./routes/admin.route'));
app.use('/api/albums', require('./routes/album.route'));
app.use('/api/playlists', require('./routes/playlist.route'));
app.use('/api/stats', require('./routes/stats.route'));

app.get('/', (req, res) => res.send('API is running...'));

// 5. Sentry Error Handler AFTER routes
Sentry.setupExpressErrorHandler(app);

// 6. Custom Global Error Handler
app.use((err, req, res, next) => {
    Logger.error(`${req.method} ${req.url} - ${err.message}`);

    // Safety check for CORS on error response
    const origin = req.headers.origin;
    const allowedOrigins = ["http://localhost:3000", "https://musicshoot.vercel.app"];
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (process.env.NODE_ENV !== "production") {
        Logger.debug(err.stack);
    }

    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: status === 500 && process.env.NODE_ENV === "production"
            ? "Internal Server Error"
            : err.message
    });
});

// 7. Database & Server start
const port = process.env.PORT || 5000;
connectDB();

httpServer.listen(port, () => {
    Logger.info(`Server is running on port ${port}`);
});

module.exports = app;