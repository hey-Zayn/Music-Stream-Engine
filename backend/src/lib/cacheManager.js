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
     * Purges keys using non-blocking SCAN (O(1) per step)
     */
    async purgePattern(pattern) {
        try {
            let totalPurged = 0;
            const iterator = await redisClient.scanIterator({
                MATCH: pattern,
                COUNT: 100
            });

            for await (const key of iterator) {
                await redisClient.del(key);
                totalPurged++;
            }

            if (totalPurged > 0) {
                console.log(`Purged ${totalPurged} keys matching ${pattern}`);
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
