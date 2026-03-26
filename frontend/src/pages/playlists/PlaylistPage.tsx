import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePlaylistStore } from "@/store/usePlaylistStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Play, Clock, Trash2, Pause } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableSongItem from "@/components/playlist/SortableSongItem";

const PlaylistPage = () => {
    const { id } = useParams();
    const { currentPlaylist, fetchPlaylistById, reorderSongs, deletePlaylist, removeSongFromPlaylist, isLoading } = usePlaylistStore();
    const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (id) fetchPlaylistById(id);
    }, [id, fetchPlaylistById]);

    if (isLoading || !currentPlaylist) {
        return <div className="p-6">Loading playlist...</div>;
    }

    const handlePlayPlaylist = () => {
        if (!currentPlaylist.songs.length) return;
        
        const isCurrentPlaylistPlaying = currentSong?.albumId === currentPlaylist._id;
        if (isCurrentPlaylistPlaying) {
            togglePlay();
        } else {
            playAlbum(currentPlaylist.songs, 0);
        }
    };

    const handlePlaySong = (index: number) => {
        playAlbum(currentPlaylist.songs, index);
    };

    const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = currentPlaylist.songs.findIndex((s) => s._id === active.id);
            const newIndex = currentPlaylist.songs.findIndex((s) => s._id === over.id);

            const newSongs = arrayMove(currentPlaylist.songs, oldIndex, newIndex);
            reorderSongs(currentPlaylist._id, newSongs);
        }
    };

    return (
        <div className="h-full bg-zinc-900">
            <ScrollArea className="h-full">
                {/* Header */}
                <div className="relative h-64 md:h-80 flex items-end p-6 bg-gradient-to-b from-zinc-700 to-zinc-900">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-end w-full">
                        <div className="size-48 md:size-60 rounded-lg bg-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden">
                            {currentPlaylist.imageUrl ? (
                                <img src={currentPlaylist.imageUrl} alt={currentPlaylist.name} className="size-full object-cover" />
                            ) : (
                                <Play className="size-20 text-zinc-600 fill-zinc-600" />
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-sm font-bold uppercase">Playlist</p>
                            <h1 className="text-4xl md:text-7xl font-black my-2">{currentPlaylist.name}</h1>
                            <p className="text-zinc-400">{currentPlaylist.description}</p>
                            <div className="mt-4 flex items-center gap-2 text-sm">
                                <span className="font-bold">You</span>
                                <span className="text-zinc-400">• {currentPlaylist.songs.length} songs</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 flex items-center gap-4">
                    <Button
                        size="icon"
                        className="size-14 rounded-full bg-green-500 hover:bg-green-400"
                        onClick={handlePlayPlaylist}
                    >
                        {isPlaying && currentSong?.albumId === currentPlaylist._id ? (
                             <Pause className="size-7 fill-black text-black" />
                        ) : (
                             <Play className="size-7 fill-black text-black" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                        onClick={() => deletePlaylist(currentPlaylist._id)}
                    >
                        <Trash2 className="size-6" />
                    </Button>
                </div>

                {/* Songs List */}
                <div className="px-6 pb-6">
                    <div className="grid grid-cols-[16px_4fr_3fr_1fr] gap-4 px-4 py-2 text-zinc-400 border-b border-zinc-800 text-sm mb-4">
                        <div>#</div>
                        <div>Title</div>
                        <div className="hidden md:block">Album</div>
                        <div className="flex justify-end"><Clock className="size-4" /></div>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={currentPlaylist.songs.map(s => s._id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-1">
                                {currentPlaylist.songs.map((song, index) => (
                                    <SortableSongItem
                                        key={song._id}
                                        song={song}
                                        index={index}
                                        removeSong={() => removeSongFromPlaylist(currentPlaylist._id, song._id)}
                                        playSong={() => handlePlaySong(index)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                    
                    {currentPlaylist.songs.length === 0 && (
                        <div className="text-center py-20 text-zinc-500">
                            <p className="text-xl">Your playlist is empty.</p>
                            <p className="mt-2 text-sm">Add some songs to get started!</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default PlaylistPage;
