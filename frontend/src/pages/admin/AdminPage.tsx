import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'
import Header from './components/Header';
import DashboardStats from './components/DashboardStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Album, Music } from 'lucide-react';
import SongsTabContent from './components/SongsTabContent';
import AlbumsTabContent from './components/AlbumsTabContent';
import { useSongStore } from '@/store/useSongStore';
import { useAlbumStore } from '@/store/useAlbumStore';
import { useStatsStore } from '@/store/useStatsStore';

const AdminPage = () => {

    const { isLoading } = useAuthStore();
    const { fetchStats } = useStatsStore();
    const { fetchSongs } = useSongStore();
    const { fetchAlbums } = useAlbumStore();
    useEffect(() => {
        fetchStats(true);
        fetchSongs(true);
        fetchAlbums(true);
    }, [fetchStats, fetchSongs, fetchAlbums]);

    if (isLoading) return <div>Loading...</div>
    return (
        <div className='min-h-screen bg-linear-to-b from-zinc-900 via-zinc-900
   to-black text-zinc-100 p-4 md:p-8'>
            <Header />
            <DashboardStats />
            <div>
                <Tabs defaultValue='songs' className='space-y-6'>
                    <TabsList className='p-1 bg-zinc-800/50'>
                        <TabsTrigger value='songs' className='data-[state=active]:bg-zinc-700'>
                            <Music className='mr-2 size-4' />
                            Songs
                        </TabsTrigger>
                        <TabsTrigger value='albums' className='data-[state=active]:bg-zinc-700'>
                            <Album className='mr-2 size-4' />
                            Albums
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='songs'>
                        <SongsTabContent />
                    </TabsContent>
                    <TabsContent value='albums'>
                        <AlbumsTabContent />
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    )
}

export default AdminPage