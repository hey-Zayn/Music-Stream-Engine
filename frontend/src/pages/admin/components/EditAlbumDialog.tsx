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
import { useAlbumStore } from "@/store/useAlbumStore";
import { Edit, Upload } from "lucide-react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import type { Album } from "@/types";

interface EditAlbumDialogProps {
	album: Album;
}

const EditAlbumDialog = ({ album }: EditAlbumDialogProps) => {
	const { isLoading, updateAlbum } = useAlbumStore();
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		title: album.title,
		artist: album.artist,
		releaseYear: album.releaseYear.toString(),
	});

	const [files, setFiles] = useState<{ image: File | null }>({
		image: null,
	});

	const [imagePreview, setImagePreview] = useState<string | null>(album.imageUrl);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async () => {
		try {
			const data = new FormData();
			data.append("title", formData.title);
			data.append("artist", formData.artist);
			data.append("releaseYear", formData.releaseYear);
			if (files.image) data.append("imageFile", files.image);

			await updateAlbum(album._id, data);
			setOpen(false);
		} catch (error: unknown) {
			const e = error as { message?: string };
			toast.error("Failed to update album: " + (e.message || "Unknown error"));
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='ghost' size='sm' className='text-zinc-400 hover:text-white'>
					<Edit className='h-4 w-4' />
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-800'>
				<DialogHeader>
					<DialogTitle>Edit Album</DialogTitle>
					<DialogDescription>Update album details and cover art</DialogDescription>
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
						<label className='text-sm font-medium' htmlFor='title'>Album Title</label>
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
						<label className='text-sm font-medium' htmlFor='releaseYear'>Release Year</label>
						<Input
							id='releaseYear'
							type='number'
							value={formData.releaseYear}
							onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setOpen(false)} disabled={isLoading} className='border-zinc-700 hover:bg-zinc-800'>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading} className='bg-emerald-500 hover:bg-emerald-600 text-white'>
						{isLoading ? "Updating..." : "Update Album"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditAlbumDialog;
