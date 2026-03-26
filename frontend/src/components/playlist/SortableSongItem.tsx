import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Play, Pause, Trash2, GripVertical } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Song } from "@/types";

interface SortableSongItemProps {
    song: Song;
    index: number;
    removeSong: () => void;
    playSong: () => void;
}

const SortableSongItem = ({ song, index, removeSong, playSong }: SortableSongItemProps) => {
    const { currentSong, isPlaying, togglePlay } = usePlayerStore();
    const isCurrentSong = currentSong?._id === song._id;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: song._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    const handlePlay = () => {
        if (isCurrentSong) {
            togglePlay();
        } else {
            playSong();
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="grid grid-cols-[16px_4fr_3fr_1fr] gap-4 px-4 py-2 hover:bg-white/5 rounded-md group items-center"
        >
            <div className="flex items-center justify-center text-zinc-400 group-hover:hidden">
                {index + 1}
            </div>
            <div className="hidden group-hover:flex items-center justify-center">
                <button onClick={handlePlay}>
                    {isCurrentSong && isPlaying ? (
                        <Pause className="size-4 text-green-500 fill-green-500" />
                    ) : (
                        <Play className="size-4 text-white fill-white" />
                    )}
                </button>
            </div>

            <div className="flex items-center gap-3">
                <img src={song.imageUrl} alt={song.title} className="size-10 rounded object-cover" />
                <div className="min-w-0">
                    <p className={`font-medium truncate ${isCurrentSong ? "text-green-500" : "text-white"}`}>
                        {song.title}
                    </p>
                    <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                </div>
            </div>

            <div className="hidden md:block text-sm text-zinc-400 truncate">
                {song.albumId ? "Album" : "Single"}
            </div>

            <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-zinc-400 group-hover:hidden">
                    {formatDuration(song.duration)}
                </span>
                <div className="hidden group-hover:flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-zinc-400 hover:text-red-500"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeSong();
                        }}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-white">
                        <GripVertical className="size-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortableSongItem;
