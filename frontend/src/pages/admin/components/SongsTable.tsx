import { Calendar, Trash2, Search, Music } from "lucide-react";
import AddToPlaylistDialog from "@/components/playlist/AddToPlaylistDialog";
import EditSongDialog from "./EditSongDialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSongStore } from "@/store/useSongStore";
import { memo } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SongsTable = memo(() => {
    const { songs, isSongsLoading, error, deleteSong } = useSongStore();
    const [searchTerm, setSearchTerm] = useState("");
    
    // Filter songs based on search
    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isSongsLoading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='text-zinc-400'>Loading songs...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='text-red-400'>{error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <Search className="h-4 w-4 text-zinc-400" />
                <Input 
                    placeholder="Search songs or artists..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm bg-zinc-800/50 border-zinc-700/50"
                />
            </div>
            
            <div className="rounded-md border border-zinc-800 bg-black/20">
                <Table>
                    <TableHeader>
                        <TableRow className='hover:bg-zinc-800/50 border-zinc-800/50'>
                            <TableHead className='w-[50px] text-zinc-400'></TableHead>
                            <TableHead className="text-zinc-400">Title</TableHead>
                            <TableHead className="text-zinc-400">Artist</TableHead>
                            <TableHead className="text-zinc-400">Release Date</TableHead>
                            <TableHead className='text-right text-zinc-400'>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredSongs.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className='h-48 text-center'>
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="bg-zinc-800/50 p-4 rounded-full">
                                            <Music className="h-8 w-8 text-zinc-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-zinc-300 font-medium tracking-tight">No songs found</p>
                                            <p className="text-sm text-zinc-500">
                                                {searchTerm ? "No songs match your search query." : "Upload your first song to get started!"}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSongs.map((song) => (
                            <TableRow key={song._id} className='hover:bg-zinc-800/50 border-zinc-800/50'>
                        <TableCell>
                            <img src={song.imageUrl} alt={song.title} className='size-10 rounded object-cover' />
                        </TableCell>
                        <TableCell className='font-medium'>{song.title}</TableCell>
                        <TableCell>{song.artist}</TableCell>
                        <TableCell>
                            <span className='inline-flex items-center gap-1 text-zinc-400'>
                                <Calendar className='h-4 w-4' />
                                {song.createdAt.split("T")[0]}
                            </span>
                        </TableCell>

                        <TableCell className='text-right'>
                            <div className='flex gap-2 justify-end items-center'>
                                <AddToPlaylistDialog songId={song._id} />
                                <EditSongDialog song={song} />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant={"ghost"}
                                            size={"sm"}
                                            className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
                                        >
                                            <Trash2 className='size-4' />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-zinc-400">
                                                This will permanently delete "{song.title}" from the database. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-transparent text-white border-zinc-700 hover:bg-zinc-800">Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={() => deleteSong(song._id)}
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                            >
                                                Yes, Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </TableCell>
                    </TableRow>
                    ))
                )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
});

export default SongsTable;