import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import type { Song } from '@/types';
import toast from 'react-hot-toast';

interface SongStore {
    songs: Song[];
    Single: Song[];
    isSongsLoading: boolean;
    isLoading: boolean;
    error: string | null;

    fetchSongs: (userOnly?: boolean) => Promise<void>;
    fetchSingleSong: () => Promise<void>;
    deleteSong: (id: string) => Promise<void>;
    updateSong: (id: string, formData: FormData) => Promise<void>;
}

export const useSongStore = create<SongStore>((set) => ({
    songs: [],
    Single: [],
    isSongsLoading: false,
    isLoading: false,
    error: null,

    fetchSongs: async (userOnly = false) => {
        set({ isSongsLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/songs${userOnly ? '?user=true' : ''}`);
            set({ songs: response.data.songs || response.data });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            const message = error?.response?.data?.message || error?.message || "Error fetching songs";
            set({ error: message });
            toast.error(message);
        } finally {
            set({ isSongsLoading: false });
        }
    },

    fetchSingleSong: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get('/songs/single');
            set({ Single: response.data.songs || response.data });
        } catch {
            set({ error: "Failed to fetch single song" });
            toast.error("Failed to fetch single song");
        } finally {
            set({ isLoading: false });
        }
    },

    deleteSong: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/songs/${id}`);
            set((state) => ({
                songs: state.songs.filter((song) => song._id !== id),
            }));
            toast.success("Song deleted successfully");
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            toast.error(e?.response?.data?.message || "Error deleting song");
        } finally {
            set({ isLoading: false });
        }
    },

    updateSong: async (id, formData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.put(`/songs/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            set((state) => ({
                songs: state.songs.map((song) => song._id === id ? response.data.song : song)
            }));
            toast.success("Song updated successfully");
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            toast.error(e?.response?.data?.message || "Error updating song");
        } finally {
            set({ isLoading: false });
        }
    },
}));
