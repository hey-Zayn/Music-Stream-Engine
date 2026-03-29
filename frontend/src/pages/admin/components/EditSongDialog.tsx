import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSongStore } from "@/store/useSongStore";
import { useAlbumStore } from "@/store/useAlbumStore";
import { Edit, Upload } from "lucide-react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import type { Song } from "@/types";

interface EditSongDialogProps {
	song: Song;
}

const EditSongDialog = ({ song }: EditSongDialogProps) => {
	const { isLoading, updateSong } = useSongStore();
	const { albums } = useAlbumStore();
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		title: song.title,
		artist: song.artist,
		album: song.albumId || "",
		duration: song.duration.toString(),
	});

	const [files, setFiles] = useState<{ image: File | null }>({
		image: null,
	});

	const [imagePreview, setImagePreview] = useState<string | null>(song.imageUrl);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async () => {
		try {
			const data = new FormData();
			if (!formData.title.trim()) return toast.error("Title is required");
			if (!formData.artist.trim()) return toast.error("Artist is required");
			if (!formData.album || formData.album === "none") return toast.error("Album is required");

			if (formData.album && formData.album !== "none") data.append("albumId", formData.album);
			if (files.image) data.append("imageFile", files.image);

			await updateSong(song._id, data);
			setOpen(false);
		} catch (error: unknown) {
			const e = error as { message?: string };
			toast.error("Failed to update song: " + (e.message || "Unknown error"));
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='ghost' size='sm' className='text-zinc-400 hover:text-white'>
					<Edit className='h-4 w-4' />
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-800 max-h-[80vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Edit Song</DialogTitle>
					<DialogDescription>Update song details and artwork</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<input
						type='file'
						accept='image/*'
						ref={imageInputRef}
						className='hidden'
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) {
								setFiles({ image: file });
								setImagePreview(URL.createObjectURL(file));
							}
						}}
					/>

					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
						onClick={() => imageInputRef.current?.click()}
					>
						<div className='text-center'>
							{imagePreview ? (
								<div className='space-y-2'>
									<img src={imagePreview} alt='Preview' className='w-20 h-20 object-cover mx-auto rounded' />
									<div className='text-xs text-zinc-400'>Click to change artwork</div>
								</div>
							) : (
								<>
									<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400'>Upload artwork</div>
								</>
							)}
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium' htmlFor='title'>Title</label>
						<Input
							id='title'
							value={formData.title}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium' htmlFor='artist'>Artist</label>
						<Input
							id='artist'
							value={formData.artist}
							onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium' htmlFor='duration'>Duration (seconds)</label>
						<Input
							id='duration'
							type='number'
							value={formData.duration}
							onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium' htmlFor='album'>Album</label>
						<Select
							value={formData.album}
							onValueChange={(value) => setFormData({ ...formData, album: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Select album' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								{albums.map((album) => (
									<SelectItem key={album._id} value={album._id}>
										{album.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setOpen(false)} disabled={isLoading} className='border-zinc-700 hover:bg-zinc-800'>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading} className='bg-emerald-500 hover:bg-emerald-600 text-white'>
						{isLoading ? "Updating..." : "Update Song"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditSongDialog;
