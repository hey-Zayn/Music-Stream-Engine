import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import type { Album, Song, Stats } from '@/types';
import toast from 'react-hot-toast';

interface MusicStore {
    songs: Song[];
    albums: Album[];
    isLoading: boolean;
    error: string | null;
    currentAlbum: Album | null,
    featuredSongs: Song[],
    madeForYouSongs: Song[],
    trendingSongs: Song[],
    Single: [],
    stats: Stats,
    isSongsLoading: boolean,
    isStatsLoading: boolean,


    fetchAlbums: () => Promise<void>,
    fetchAlbumById: (id: string) => Promise<void>
    fetchFeaturedSongs: () => Promise<void>,
    fetchMadeForYou: () => Promise<void>,
    fetchTrendingSongs: () => Promise<void>,
    fetchStats: () => Promise<void>,
    fetchSongs: () => Promise<void>,
    deleteSong: (id: string) => Promise<void>,
    deleteAlbum: (id: string) => Promise<void>,

    fetchSingleSong: () => Promise<void>,
}



export const useMusicStore = create<MusicStore>((set) => {
    const fetchWrapper = async (url: string, key: keyof MusicStore, errorMessage: string, isLoadingKey: keyof MusicStore = 'isLoading') => {
        set({ [isLoadingKey]: true, error: null } as any);
        try {
            const response = await axiosInstance.get(url);
            const data = response.data.songs || response.data.albums || response.data.album || response.data;
            set({ [key]: data } as any);
        } catch (error) {
            const e = error as any;
            const message = e?.response?.data?.message || e?.message || errorMessage;
            set({ error: message } as any);
            toast.error(message);
        } finally {
            set({ [isLoadingKey]: false } as any);
        }
    };

    return {
        albums: [],
        songs: [],
        isLoading: false,
        error: null,
        currentAlbum: null,
        featuredSongs: [],
        madeForYouSongs: [],
        trendingSongs: [],
        Single: [],
        stats: {
            totalSongs: 0,
            totalAlbums: 0,
            totalUsers: 0,
            totalArtists: 0,
        },
        isSongsLoading: false,
        isStatsLoading: false,

        fetchSingleSong: () => fetchWrapper('/songs/single', 'Single', 'Failed to fetch single song'),
        fetchFeaturedSongs: () => fetchWrapper('/songs/featured', 'featuredSongs', 'Error fetching featured songs'),
        fetchMadeForYou: () => fetchWrapper('/songs/made-for-you', 'madeForYouSongs', 'Error fetching made-for-you songs'),
        fetchTrendingSongs: () => fetchWrapper('/songs/trending', 'trendingSongs', 'Error fetching trending songs'),
        fetchStats: () => fetchWrapper('/stats', 'stats', 'Error fetching stats'),
        fetchAlbums: () => fetchWrapper('/albums', 'albums', 'Error fetching albums'),
        fetchAlbumById: (id) => fetchWrapper(`/albums/${id}`, 'currentAlbum', 'Error fetching album'),
        fetchSongs: () => fetchWrapper('/songs', 'songs', 'Error fetching songs', 'isSongsLoading'),

        deleteSong: async (id) => {
            set({ isLoading: true, error: null });
            try {
                await axiosInstance.delete(`/admin/songs/${id}`);
                set((state) => ({
                    songs: state.songs.filter((song) => song._id !== id),
                }));
                toast.success("Song deleted successfully");
            } catch (error) {
                const e = error as any;
                toast.error(e?.response?.data?.message || "Error deleting song");
            } finally {
                set({ isLoading: false });
            }
        },

        deleteAlbum: async (id) => {
            set({ isLoading: true, error: null });
            try {
                await axiosInstance.delete(`/admin/albums/${id}`);
                set((state) => ({
                    albums: state.albums.filter((album) => album._id !== id),
                    // If a song belongs to this album, clear its albumId
                    songs: state.songs.map((song) =>
                        song.albumId === id ? { ...song, albumId: null } : song
                    ),
                }));
                toast.success("Album deleted successfully");
            } catch (error) {
                const e = error as any;
                toast.error(e?.response?.data?.message || "Failed to delete album");
            } finally {
                set({ isLoading: false });
            }
        },
    };
});

