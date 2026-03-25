import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMusicStore } from './useMusicStore';
import { axiosInstance } from '../lib/axios';

// Mock axios
vi.mock('../lib/axios', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useMusicStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default states', () => {
    const state = useMusicStore.getState();
    expect(state.songs).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('should fetch songs successfully', async () => {
    const mockSongs = [{ _id: '1', title: 'Song 1' }];
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: mockSongs });

    await useMusicStore.getState().fetchSongs();

    const state = useMusicStore.getState();
    expect(state.songs).toEqual(mockSongs);
    expect(state.isLoading).toBe(false);
  });

  it('should handle fetch error', async () => {
    vi.mocked(axiosInstance.get).mockRejectedValueOnce(new Error('Fetch failed'));

    await useMusicStore.getState().fetchSongs();

    const state = useMusicStore.getState();
    expect(state.error).toBe('Fetch failed');
    expect(state.isLoading).toBe(false);
  });
});
