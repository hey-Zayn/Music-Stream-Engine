const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
            if (retries > 3) return new Error('Retry limit exceeded');
            return Math.min(retries * 50, 500);
        }
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Immediate connection for a long-running process
if (process.env.NODE_ENV !== 'test') {
    (async () => {
        try {
            await redisClient.connect();
            console.log('Connected to Redis Cloud successfully');
        } catch (err) {
            console.error('Failed to connect to Redis:', err);
        }
    })();
}

module.exports = redisClient;
