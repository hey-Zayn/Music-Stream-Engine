import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/store/useMusicStore";
import { Calendar, Music, Trash2 } from "lucide-react";
import EditAlbumDialog from "./EditAlbumDialog";

const AlbumsTable = () => {
	const { albums, deleteAlbum, isLoading } = useMusicStore();
	
	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>Loading albums...</div>
			</div>
		);
	}

	// useEffect removed as parent AdminPage handles fetching with proper filtering

	return (
		<Table>
			<TableHeader>
				<TableRow className='hover:bg-zinc-800/50'>
					<TableHead className='w-[50px]'></TableHead>
					<TableHead>Title</TableHead>
					<TableHead>Artist</TableHead>
					<TableHead>Release Year</TableHead>
					<TableHead>Songs</TableHead>
					<TableHead className='text-right'>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{albums.length === 0 ? (
					<TableRow>
						<TableCell colSpan={6} className='h-24 text-center text-zinc-500'>
							No albums found. Create your first album!
						</TableCell>
					</TableRow>
				) : (
					albums.map((album) => (
					<TableRow key={album._id} className='hover:bg-zinc-800/50'>
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
								<Button
									variant='ghost'
									size='sm'
									onClick={() => deleteAlbum(album._id)}
									className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
								>
									<Trash2 className='h-4 w-4' />
								</Button>
							</div>
						</TableCell>
					</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
};
export default AlbumsTable;