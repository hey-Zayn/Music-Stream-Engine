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
import { axiosInstance } from "@/lib/axios";
import { useSongStore } from "@/store/useSongStore";
import { useAlbumStore } from "@/store/useAlbumStore";
import { Plus, Upload, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface JSTag {
	tags: {
		title?: string;
		artist?: string;
		album?: string;
		picture?: {
			data: number[];
			format: string;
		};
	};
}

declare global {
  interface Window {
    jsmediatags: {
		read: (file: File, options: {
			onSuccess: (tag: JSTag) => void;
			onError: (error: { message: string }) => void;
		}) => void;
	};
  }
}

interface NewSong {
	title: string;
	artist: string;
	album: string;
	duration: string;
}

const AddSongDialog = () => {
	const { isLoading, fetchSongs } = useSongStore();
	const { albums, fetchAlbums } = useAlbumStore();
	const [songDialogOpen, setSongDialogOpen] = useState(false);
	const [newSong, setNewSong] = useState<NewSong>({
		title: "",
		artist: "",
		album: "",
		duration: "0",
	});

	const [files, setFiles] = useState<{ audio: File | null; image: File | null }>({
		audio: null,
		image: null,
	});

	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadDetails, setUploadDetails] = useState({ loaded: 0, total: 0 });
	
	const [isDraggingImage, setIsDraggingImage] = useState(false);
	const [isDraggingAudio, setIsDraggingAudio] = useState(false);

	const audioInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		fetchAlbums(true);
		// Load jsmediatags script
		const script = document.createElement("script");
		script.src = "https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js";
		script.async = true;
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		};
	}, [fetchAlbums]);

	const handleAudioSelect = (file: File) => {
		setFiles((prev) => ({ ...prev, audio: file }));
		
		// Create a temporary audio element to read duration
		const audio = new Audio();
		audio.src = URL.createObjectURL(file);
		audio.onloadedmetadata = () => {
			setNewSong((prev) => ({ ...prev, duration: Math.floor(audio.duration).toString() }));
			URL.revokeObjectURL(audio.src);
		};

		// Read metadata using jsmediatags
		if (window.jsmediatags) {
			window.jsmediatags.read(file, {
				onSuccess: (tag: JSTag) => {
					const { tags } = tag;
					setNewSong((prev) => ({
						...prev,
						title: tags.title || prev.title,
						artist: tags.artist || prev.artist,
						album: tags.album || prev.album,
					}));

					if (tags.picture) {
						const { data, format } = tags.picture;
						let base64String = "";
						for (let i = 0; i < data.length; i++) {
							base64String += String.fromCharCode(data[i]);
						}
						const imageUrl = `data:${format};base64,${window.btoa(base64String)}`;
						setImagePreview(imageUrl);

						// Convert base64 to File object for upload
						fetch(imageUrl)
							.then(res => res.blob())
							.then(blob => {
								const imageFile = new File([blob], "artwork.jpg", { type: format });
								setFiles((prev) => ({ ...prev, image: imageFile }));
							});
					}
				},
				onError: (error: { message: string }) => {
					console.error("Error reading audio tags:", error);
					toast.error("Failed to read audio metadata.");
				},
			});
		}
	};

	const handleSubmit = async () => {
		// setIsLoading(true); // Removed as isLoading is from store

		try {
			if (!files.audio || !files.image) {
				return toast.error("Please upload both audio and image files");
			}

			if (!newSong.title.trim()) {
				return toast.error("Title is required");
			}

			if (!newSong.artist.trim()) {
				return toast.error("Artist is required");
			}

			const formData = new FormData();

			formData.append("title", newSong.title);
			formData.append("artist", newSong.artist);
			formData.append("duration", newSong.duration);
			if (newSong.album && newSong.album !== "none") {
				formData.append("albumId", newSong.album);
			}

			formData.append("audioFile", files.audio);
			formData.append("imageFile", files.image);

			await axiosInstance.post("/songs", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: (progressEvent) => {
					const progress = progressEvent.total
						? Math.round((progressEvent.loaded * 100) / progressEvent.total)
						: 0;
					setUploadProgress(progress);
					setUploadDetails({
						loaded: progressEvent.loaded,
						total: progressEvent.total || 0,
					});
				},
			});

			setNewSong({
				title: "",
				artist: "",
				album: "",
				duration: "0",
			});

			setFiles({
				audio: null,
				image: null,
			});
			setImagePreview(null); // Clear image preview
			toast.success("Song added successfully");
			fetchSongs(true); // Refresh songs list with userOnly=true flag
			setSongDialogOpen(false); // Close dialog on success
			setUploadProgress(0); // Reset progress
			setUploadDetails({ loaded: 0, total: 0 });
		} catch (error: unknown) {
			const e = error as { message?: string };
			toast.error("Failed to add song: " + e.message);
		} finally {
			// setIsLoading(false); // Removed as isLoading is from store
		}
	};

	return (
		<Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
			<DialogTrigger asChild>
				<Button className='bg-emerald-500 hover:bg-emerald-600 text-black'>
					<Plus className='mr-2 h-4 w-4' />
					Add Song
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Add New Song</DialogTitle>
					<DialogDescription>Add a new song to your music library</DialogDescription>
				</DialogHeader>

				{albums.length === 0 && (
					<div className='bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg space-y-2 mt-4'>
						<p className='text-sm text-emerald-500 font-medium'>
							Tip: Better to create an album first!
						</p>
						<p className='text-xs text-zinc-400'>
							Creating an album helps you organize your music and makes it easier for others to discover your work.
						</p>
					</div>
				)}

				<div className='space-y-4 py-4'>
					<input
						type='file'
						accept='audio/*'
						ref={audioInputRef}
						hidden
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) handleAudioSelect(file);
						}}
					/>

					<input
						type='file'
						ref={imageInputRef}
						className='hidden'
						accept='image/*'
						onChange={(e) => setFiles((prev) => ({ ...prev, image: e.target.files![0] }))}
					/>

					{/* image upload area */}
					<div
						className={`flex items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
							isDraggingImage ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50"
						}`}
						onClick={() => imageInputRef.current?.click()}
						onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
						onDragLeave={() => setIsDraggingImage(false)}
						onDrop={(e) => {
							e.preventDefault();
							setIsDraggingImage(false);
							if (e.dataTransfer.files && e.dataTransfer.files[0] && e.dataTransfer.files[0].type.startsWith("image/")) {
								setFiles((prev) => ({ ...prev, image: e.dataTransfer.files[0] }));
							} else {
								toast.error("Please drop an image file.");
							}
						}}
					>
						<div className='text-center'>
							{files.image ? (
								<div className='space-y-2'>
									<div className='text-sm text-emerald-500'>Image selected:</div>
									<div className='text-xs text-zinc-400'>{files.image.name.slice(0, 20)}</div>
									{imagePreview && (
										<img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover mx-auto rounded" />
									)}
								</div>
							) : (
								<>
									<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400 mb-2'>Upload artwork</div>
									<Button variant='outline' size='sm' className='text-xs'>
										Choose File
									</Button>
								</>
							)}
						</div>
					</div>

					{/* Audio upload */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Audio File</label>
						<div 
							className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
								isDraggingAudio ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50"
							}`}
							onClick={() => audioInputRef.current?.click()}
							onDragOver={(e) => { e.preventDefault(); setIsDraggingAudio(true); }}
							onDragLeave={() => setIsDraggingAudio(false)}
							onDrop={(e) => {
								e.preventDefault();
								setIsDraggingAudio(false);
								if (e.dataTransfer.files && e.dataTransfer.files[0] && e.dataTransfer.files[0].type.startsWith("audio/")) {
									handleAudioSelect(e.dataTransfer.files[0]);
								} else {
									toast.error("Please drop an audio file.");
								}
							}}
						>
							{files.audio ? (
								<div className="text-sm text-emerald-500 truncate text-center">
									{files.audio.name}
								</div>
							) : (
								<div className="text-sm text-zinc-400 text-center flex flex-col items-center">
									<Upload className="h-4 w-4 mb-2" />
									Click or drag audio file here
								</div>
							)}
						</div>
					</div>

					{/* other fields */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Title</label>
						<Input
							value={newSong.title}
							onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artist</label>
						<Input
							value={newSong.artist}
							onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Duration (seconds)</label>
						<Input
							type='number'
							min='0'
							value={newSong.duration}
							onChange={(e) => setNewSong({ ...newSong, duration: e.target.value || "0" })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album (Optional)</label>
						<Select
							value={newSong.album}
							onValueChange={(value) => setNewSong({ ...newSong, album: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Select album' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value='none'>No Album (Single)</SelectItem>
								{albums.map((album) => (
									<SelectItem key={album._id} value={album._id}>
										{album.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Upload Progress Bar */}
					{isLoading && (
						<div className='space-y-2 pt-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 animate-in fade-in zoom-in duration-300'>
							<div className='flex justify-between text-xs font-medium mb-1'>
								<span className='text-emerald-400 flex items-center gap-2'>
									{uploadProgress < 100 ? (
										<>
											<div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
											Uploading Your Song...
										</>
									) : (
										<>
											<div className="h-2 w-2 bg-emerald-500 rounded-full" />
											Processing Metadata...
										</>
									)}
								</span>
								<div className='flex flex-col items-end gap-0.5'>
									<span className='text-zinc-400 font-mono'>{uploadProgress}%</span>
									{uploadDetails.total > 0 && (
										<span className='text-[10px] text-zinc-500'>
											{(uploadDetails.loaded / (1024 * 1024)).toFixed(1)}MB / {(uploadDetails.total / (1024 * 1024)).toFixed(1)}MB
										</span>
									)}
								</div>
							</div>
							<div className='h-2 w-full bg-zinc-800 rounded-full overflow-hidden'>
								<div
									className='h-full bg-linear-to-r from-emerald-600 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]'
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
							<p className='text-[10px] text-center text-zinc-500 italic'>
								{uploadProgress < 100 
									? "Please don't close this window until the upload is complete." 
									: "Upload complete! Finalizing song details..."
								}
							</p>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setSongDialogOpen(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading} className='bg-emerald-500 hover:bg-emerald-600 text-black min-w-[100px]'>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								{uploadProgress < 100 ? "Uploading..." : "Processing..."}
							</>
						) : (
							"Add Song"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default AddSongDialog;