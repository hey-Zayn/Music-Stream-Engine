import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import type { Album } from '@/types';
import toast from 'react-hot-toast';

interface AlbumStore {
    albums: Album[];
    currentAlbum: Album | null;
    isLoading: boolean;
    error: string | null;

    fetchAlbums: (userOnly?: boolean) => Promise<void>;
    fetchAlbumById: (id: string) => Promise<void>;
    deleteAlbum: (id: string, refreshSongs?: () => void) => Promise<void>;
    updateAlbum: (id: string, formData: FormData) => Promise<void>;
}

export const useAlbumStore = create<AlbumStore>((set) => ({
    albums: [],
    currentAlbum: null,
    isLoading: false,
    error: null,

    fetchAlbums: async (userOnly = false) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/albums${userOnly ? '?user=true' : ''}`);
            set({ albums: response.data.albums || response.data });
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } }; message?: string };
            const message = e?.response?.data?.message || e?.message || "Error fetching albums";
            set({ error: message });
            toast.error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchAlbumById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/albums/${id}`);
            set({ currentAlbum: response.data.album || response.data });
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } }; message?: string };
            const message = e?.response?.data?.message || "Error fetching album";
            set({ error: message });
            toast.error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    deleteAlbum: async (id, refreshSongs) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/albums/${id}`);
            set((state) => ({
                albums: state.albums.filter((album) => album._id !== id),
            }));
            toast.success("Album deleted successfully");
            // If passed, call the songstore refresh
            if (refreshSongs) refreshSongs();
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(e?.response?.data?.message || "Failed to delete album");
        } finally {
            set({ isLoading: false });
        }
    },

    updateAlbum: async (id, formData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.put(`/albums/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            set((state) => ({
                albums: state.albums.map((album) => album._id === id ? response.data.album : album)
            }));
            toast.success("Album updated successfully");
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(e?.response?.data?.message || "Error updating album");
        } finally {
            set({ isLoading: false });
        }
    },
}));
