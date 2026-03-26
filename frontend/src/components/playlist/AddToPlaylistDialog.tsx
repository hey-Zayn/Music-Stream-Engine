import { useState } from "react";
import { usePlaylistStore } from "@/store/usePlaylistStore";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ListMusic } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddToPlaylistDialogProps {
    songId: string;
}

const AddToPlaylistDialog = ({ songId }: AddToPlaylistDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { playlists, addSongToPlaylist, isLoading } = usePlaylistStore();

    const handleAddToPlaylist = async (playlistId: string) => {
        await addSongToPlaylist(playlistId, songId);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ListMusic className="size-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Add to Playlist</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Select a playlist to add this song to.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[300px] mt-4 pr-4">
                    <div className="space-y-2">
                        {playlists.map((playlist) => (
                            <button
                                key={playlist._id}
                                className="w-full text-left p-3 rounded-md hover:bg-zinc-800 transition-colors flex items-center gap-3 group"
                                onClick={() => handleAddToPlaylist(playlist._id)}
                                disabled={isLoading}
                            >
                                <div className="size-10 rounded bg-zinc-700 flex items-center justify-center overflow-hidden">
                                    {playlist.imageUrl ? (
                                        <img src={playlist.imageUrl} alt={playlist.name} className="size-full object-cover" />
                                    ) : (
                                        <Plus className="size-5 text-zinc-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{playlist.name}</p>
                                    <p className="text-xs text-zinc-500">{playlist.songs.length} songs</p>
                                </div>
                            </button>
                        ))}
                        {playlists.length === 0 && (
                            <div className="text-center py-10 text-zinc-500">
                                <p>You haven't created any playlists yet.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default AddToPlaylistDialog;
