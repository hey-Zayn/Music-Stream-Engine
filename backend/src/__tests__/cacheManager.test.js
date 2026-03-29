import { vi, describe, it, expect, beforeEach } from 'vitest';
const redisClient = require('../lib/redis');
const CacheManager = require('../lib/cacheManager');

describe('CacheManager', () => {
    const mockKey = 'test-key';
    const mockData = { foo: 'bar' };
    const mockTTL = 60;

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('getOrFetch', () => {
        it('should return cached data if present', async () => {
            const spyGet = vi.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify(mockData));
            const fetcher = vi.fn();

            const result = await CacheManager.getOrFetch(mockKey, mockTTL, fetcher);

            expect(result).toEqual(mockData);
            expect(spyGet).toHaveBeenCalledWith(mockKey);
            expect(fetcher).not.toHaveBeenCalled();
        });

        it('should call fetcher and set cache if data is missing', async () => {
            vi.spyOn(redisClient, 'get').mockResolvedValue(null);
            const spySet = vi.spyOn(redisClient, 'setEx').mockResolvedValue('OK');
            const fetcher = vi.fn().mockResolvedValue(mockData);

            const result = await CacheManager.getOrFetch(mockKey, mockTTL, fetcher);

            expect(result).toEqual(mockData);
            expect(fetcher).toHaveBeenCalled();
            expect(spySet).toHaveBeenCalledWith(mockKey, mockTTL, JSON.stringify(mockData));
        });

        it('should fallback to fetcher if Redis fails', async () => {
            vi.spyOn(redisClient, 'get').mockRejectedValue(new Error('Redis Down'));
            const fetcher = vi.fn().mockResolvedValue(mockData);

            const result = await CacheManager.getOrFetch(mockKey, mockTTL, fetcher);

            expect(result).toEqual(mockData);
            expect(fetcher).toHaveBeenCalled();
        });
    });

    describe('purgePattern', () => {
        it('should delete keys matching a pattern using scanIterator', async () => {
            const mockKeys = ['key1', 'key2'];
            
            // Mocking the async iterator for scanIterator
            const spyScan = vi.spyOn(redisClient, 'scanIterator').mockReturnValue((async function* () {
                for (const key of mockKeys) {
                    yield key;
                }
            })());

            const spyDel = vi.spyOn(redisClient, 'del').mockResolvedValue(1);

            await CacheManager.purgePattern('pattern:*');

            expect(spyScan).toHaveBeenCalledWith({
                MATCH: 'pattern:*',
                COUNT: 100
            });
            expect(spyDel).toHaveBeenCalledTimes(2);
            expect(spyDel).toHaveBeenCalledWith('key1');
            expect(spyDel).toHaveBeenCalledWith('key2');
        });
    });
});
