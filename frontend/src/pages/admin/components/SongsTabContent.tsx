import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";
import AddSongDialog from "./AddSongDialog";
import SongsTable from "./SongsTable";


import { useSongStore } from "@/store/useSongStore";
import NoContent from "./NoContent";

const SongsTabContent = () => {
	const { songs, isSongsLoading } = useSongStore();

	return (
		<Card className='bg-zinc-900/50 border-zinc-800/50'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Music className='size-5 text-emerald-500' />
							Songs Library
						</CardTitle>
						<CardDescription>Manage your music tracks</CardDescription>
					</div>
					<AddSongDialog />
				</div>
			</CardHeader>
			<CardContent>
				{songs.length === 0 && !isSongsLoading ? (
					<NoContent type='songs' />
				) : (
					<SongsTable />
				)}
			</CardContent>
		</Card>
	);
};
export default SongsTabContent;