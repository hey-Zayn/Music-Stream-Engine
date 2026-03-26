import { Calendar, Trash2, Search, Library } from "lucide-react";
import EditAlbumDialog from "./EditAlbumDialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAlbumStore } from "@/store/useAlbumStore";
import { memo } from "react";
import { Music } from "lucide-react";
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

const AlbumsTable = memo(() => {
    const { albums, deleteAlbum, isLoading } = useAlbumStore();
    const [searchTerm, setSearchTerm] = useState("");
    
    // Filter albums based on search
    const filteredAlbums = albums.filter(album => 
        album.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        album.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>Loading albums...</div>
			</div>
		);
	}

	// useEffect removed as parent AdminPage handles fetching with proper filtering

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <Search className="h-4 w-4 text-zinc-400" />
                <Input 
                    placeholder="Search albums or artists..." 
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
                            <TableHead className="text-zinc-400">Release Year</TableHead>
                            <TableHead className="text-zinc-400">Songs</TableHead>
                            <TableHead className='text-right text-zinc-400'>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAlbums.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className='h-48 text-center'>
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="bg-zinc-800/50 p-4 rounded-full">
                                            <Library className="h-8 w-8 text-zinc-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-zinc-300 font-medium tracking-tight">No albums found</p>
                                            <p className="text-sm text-zinc-500">
                                                {searchTerm ? "No albums match your search query." : "Create your first collection to get started!"}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAlbums.map((album) => (
                            <TableRow key={album._id} className='hover:bg-zinc-800/50 border-zinc-800/50'>
						<TableCell>
							<img src={album.imageUrl} alt={album.title} className='w-10 h-10 rounded object-cover' />
						</TableCell>
						<TableCell className='font-medium'>{album.title}</TableCell>
						<TableCell>{album.artist}</TableCell>
						<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<Calendar className='h-4 w-4' />
								{album.releaseYear}
							</span>
						</TableCell>
						<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<Music className='h-4 w-4' />
								{album.songs.length} songs
							</span>
						</TableCell>
						<TableCell className='text-right'>
							<div className='flex gap-2 justify-end items-center'>
								<EditAlbumDialog album={album} />
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant='ghost'
											size='sm'
											className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
										>
											<Trash2 className='h-4 w-4' />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent className="bg-zinc-900 border-zinc-800">
										<AlertDialogHeader>
											<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
											<AlertDialogDescription className="text-zinc-400">
												This will permanently delete "{album.title}" and all its associated songs. This action cannot be undone.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel className="bg-transparent text-white border-zinc-700 hover:bg-zinc-800">Cancel</AlertDialogCancel>
											<AlertDialogAction 
												onClick={() => deleteAlbum(album._id)}
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

export default AlbumsTable;