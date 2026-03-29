import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import type { Song, Stats } from '@/types';
import toast from 'react-hot-toast';

interface StatsStore {
    stats: Stats;
    featuredSongs: Song[];
    madeForYouSongs: Song[];
    trendingSongs: Song[];
    isLoading: boolean;
    isStatsLoading: boolean;
    error: string | null;

    fetchStats: (userOnly?: boolean) => Promise<void>;
    fetchFeaturedSongs: () => Promise<void>;
    fetchMadeForYou: () => Promise<void>;
    fetchTrendingSongs: () => Promise<void>;
}

export const useStatsStore = create<StatsStore>((set) => ({
    stats: { totalSongs: 0, totalAlbums: 0, totalUsers: 0, totalArtists: 0 },
    featuredSongs: [],
    madeForYouSongs: [],
    trendingSongs: [],
    isLoading: false,
    isStatsLoading: false,
    error: null,

    fetchStats: async (userOnly = false) => {
        set({ isStatsLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/stats${userOnly ? '?user=true' : ''}`);
            set({ stats: response.data.stats || response.data });
        } catch (error: unknown) {
            const e = error as { message?: string };
            set({ error: e?.message || "Error fetching stats" });
            toast.error(e?.message || "Error fetching stats");
        } finally {
            set({ isStatsLoading: false });
        }
    },

    fetchFeaturedSongs: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get('/songs/featured');
            set({ featuredSongs: response.data.songs || response.data });
        } catch (error: unknown) {
            const e = error as { message?: string };
            set({ error: e?.message || "Error fetching featured songs" });
            toast.error(e?.message || "Error fetching featured songs");
        } finally {
            set({ isLoading: false });
        }
    },

    fetchMadeForYou: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get('/songs/made-for-you');
            set({ madeForYouSongs: response.data.songs || response.data });
        } catch (error: unknown) {
            const e = error as { message?: string };
            set({ error: e?.message || "Error fetching made for you songs" });
            toast.error(e?.message || "Error fetching made for you songs");
        } finally {
            set({ isLoading: false });
        }
    },

    fetchTrendingSongs: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get('/songs/trending');
            set({ trendingSongs: response.data.songs || response.data });
        } catch (error: unknown) {
            const e = error as { message?: string };
            set({ error: e?.message || "Error fetching trending songs" });
            toast.error(e?.message || "Error fetching trending songs");
        } finally {
            set({ isLoading: false });
        }
    },
}));
