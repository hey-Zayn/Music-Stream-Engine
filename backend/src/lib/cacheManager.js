const redisClient = require("./redis");

/**
 * Senior-level Cache Manager with Graceful Degradation
 */
const CacheManager = {
    /**
     * getOrFetch handles errors by falling back to the database (fetcher)
     */
    async getOrFetch(key, ttl, fetcher) {
        try {
            const cached = await redisClient.get(key);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (err) {
            console.error(`Cache Read Error [${key}]:`, err);
            // Fall through to fetcher
        }

        const data = await fetcher();

        try {
            await redisClient.setEx(key, ttl, JSON.stringify(data));
        } catch (err) {
            console.error(`Cache Write Error [${key}]:`, err);
            // Non-blocking error
        }

        return data;
    },

    /**
     * Purges keys using wildcards (Note: keys() is O(N), use sparingly)
     */
    async purgePattern(pattern) {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys);
                console.log(`Purged ${keys.length} keys matching ${pattern}`);
            }
        } catch (err) {
            console.error(`Cache Purge Error [${pattern}]:`, err);
        }
    },

    async del(keys) {
        try {
            await redisClient.del(keys);
        } catch (err) {
            console.error(`Cache Del Error:`, err);
        }
    }
};

module.exports = CacheManager;
