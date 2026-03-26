const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL
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
