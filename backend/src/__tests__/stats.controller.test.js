import { vi, describe, it, expect, beforeEach } from 'vitest';
const { getStats } = require('../controllers/stats.controller');
const Song = require('../models/song.model');
const User = require('../models/user.model');
const Album = require('../models/album.model');
const CacheManager = require('../lib/cacheManager');

describe('StatsController - getStats', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {},
            auth: { userId: 'user_123' }
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };
        next = vi.fn();
        vi.restoreAllMocks();
    });

    it('should use global cache key for non-user queries', async () => {
        const spyGetOrFetch = vi.spyOn(CacheManager, 'getOrFetch').mockImplementation(async (key, ttl, fetcher) => {
             return await fetcher();
        });
        
        // Mock DB calls
        vi.spyOn(Song, 'countDocuments').mockResolvedValue(10);
        vi.spyOn(User, 'countDocuments').mockResolvedValue(5);
        vi.spyOn(Album, 'countDocuments').mockResolvedValue(2);
        vi.spyOn(Song, 'aggregate').mockResolvedValue([{ count: 3 }]);

        await getStats(req, res, next);

        expect(spyGetOrFetch).toHaveBeenCalledWith('music-app:stats:global', 600, expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalSongs: 10 }));
    });

    it('should use user-specific cache key when user=true', async () => {
        req.query.user = 'true';
        vi.spyOn(CacheManager, 'getOrFetch').mockResolvedValue({ totalSongs: 1 });

        await getStats(req, res, next);

        expect(CacheManager.getOrFetch).toHaveBeenCalledWith('music-app:stats:user_123', 600, expect.any(Function));
    });
});
