import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSongStore } from './useSongStore';
import { axiosInstance } from '../lib/axios';

// Mock axios
vi.mock('../lib/axios', () => ({
    axiosInstance: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
        put: vi.fn()
    }
}));

describe('useSongStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty songs array', () => {
        const state = useSongStore.getState();
        expect(state.songs).toEqual([]);
        expect(state.isSongsLoading).toBe(false);
    });

    it('should fetch songs successfully', async () => {
        const mockSongs = [{ _id: '1', title: 'Song 1' }];
        const spyGet = vi.spyOn(axiosInstance, 'get');
        spyGet.mockResolvedValue({ data: { songs: mockSongs } });

        await useSongStore.getState().fetchSongs();

        const state = useSongStore.getState();
        expect(state.songs).toEqual(mockSongs);
        expect(state.isSongsLoading).toBe(false);
    });

    it('should handle fetch error', async () => {
        const spyGet = vi.spyOn(axiosInstance, 'get');
        spyGet.mockRejectedValue(new Error('Fetch failed'));

        await useSongStore.getState().fetchSongs();

        const state = useSongStore.getState();
        expect(state.isSongsLoading).toBe(false);
    });
});

