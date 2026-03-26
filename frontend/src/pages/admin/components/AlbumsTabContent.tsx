import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library } from "lucide-react";
import AddAlbumDialog from "./AddAlbumDialog";
import AlbumsTable from "./AlbumsTable";


import { useAlbumStore } from "@/store/useAlbumStore";
import NoContent from "./NoContent";

const AlbumsTabContent = () => {
	const { albums, isLoading } = useAlbumStore();

	return (
		<Card className='bg-zinc-900/50 border-zinc-800/50'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Library className='h-5 w-5 text-violet-500' />
							Albums Library
						</CardTitle>
						<CardDescription>Manage your album collection</CardDescription>
					</div>
					<AddAlbumDialog />
				</div>
			</CardHeader>

			<CardContent>
				{albums.length === 0 && !isLoading ? (
					<NoContent type='albums' />
				) : (
					<AlbumsTable />
				)}
			</CardContent>
		</Card>
	);
};
export default AlbumsTabContent;