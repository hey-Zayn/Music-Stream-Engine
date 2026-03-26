import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import type { Song } from '@/types';
import toast from 'react-hot-toast';

interface Playlist {
    _id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    creator: string;
    songs: Song[];
    createdAt: string;
    updatedAt: string;
}

interface PlaylistStore {
    playlists: Playlist[];
    currentPlaylist: Playlist | null;
    isLoading: boolean;
    error: string | null;

    fetchPlaylists: () => Promise<void>;
    fetchPlaylistById: (id: string) => Promise<void>;
    createPlaylist: (data: { name: string; description?: string; imageUrl?: string }) => Promise<void>;
    updatePlaylist: (id: string, data: Partial<Playlist>) => Promise<void>;
    deletePlaylist: (id: string) => Promise<void>;
    addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
    removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
    reorderSongs: (playlistId: string, songs: Song[]) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
    playlists: [],
    currentPlaylist: null,
    isLoading: false,
    error: null,

    fetchPlaylists: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get('/playlists');
            set({ playlists: response.data });
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            const message = e.response?.data?.message || "Error fetching playlists";
            set({ error: message });
            toast.error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchPlaylistById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/playlists/${id}`);
            set({ currentPlaylist: response.data });
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            const message = e.response?.data?.message || "Error fetching playlist";
            set({ error: message });
            toast.error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    createPlaylist: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/playlists', data);
            set((state) => ({ playlists: [...state.playlists, response.data] }));
            toast.success("Playlist created successfully");
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            const message = e.response?.data?.message || "Error creating playlist";
            toast.error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    updatePlaylist: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.put(`/playlists/${id}`, data);
            set((state) => ({
                playlists: state.playlists.map(p => p._id === id ? response.data : p),
                currentPlaylist: state.currentPlaylist?._id === id ? response.data : state.currentPlaylist
            }));
            toast.success("Playlist updated successfully");
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            const message = e.response?.data?.message || "Error updating playlist";
            toast.error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    deletePlaylist: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/playlists/${id}`);
            set((state) => ({
                playlists: state.playlists.filter(p => p._id !== id),
                currentPlaylist: state.currentPlaylist?._id === id ? null : state.currentPlaylist
            }));
            toast.success("Playlist deleted successfully");
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            const message = e.response?.data?.message || "Error deleting playlist";
            toast.error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    addSongToPlaylist: async (playlistId, songId) => {
        try {
            const response = await axiosInstance.post(`/playlists/${playlistId}/songs`, { songId });
            set((state) => ({
                playlists: state.playlists.map(p => p._id === playlistId ? response.data : p),
                currentPlaylist: state.currentPlaylist?._id === playlistId ? response.data : state.currentPlaylist
            }));
            toast.success("Song added to playlist");
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            const message = e.response?.data?.message || "Error adding song";
            toast.error(message);
        }
    },

    removeSongFromPlaylist: async (playlistId, songId) => {
        try {
            const response = await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);
            set((state) => ({
                playlists: state.playlists.map(p => p._id === playlistId ? response.data : p),
                currentPlaylist: state.currentPlaylist?._id === playlistId ? response.data : state.currentPlaylist
            }));
            toast.success("Song removed from playlist");
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            const message = e.response?.data?.message || "Error removing song";
            toast.error(message);
        }
    },

    reorderSongs: async (playlistId, songs) => {
        // Optimistic update
        const previousPlaylist = get().currentPlaylist;
        const songIds = songs.map(s => s._id);

        set((state) => ({
            currentPlaylist: state.currentPlaylist?._id === playlistId ? { ...state.currentPlaylist, songs } : state.currentPlaylist
        }));

        try {
            await axiosInstance.put(`/playlists/${playlistId}`, { songs: songIds });
        } catch {
            // Rollback on error
            set({ currentPlaylist: previousPlaylist });
            toast.error("Failed to save new order");
        }
    }
}));
