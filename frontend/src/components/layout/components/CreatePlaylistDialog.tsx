import { useState } from "react";
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
import { Plus } from "lucide-react";
import { usePlaylistStore } from "../../../store/usePlaylistStore";

const CreatePlaylistDialog = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const { createPlaylist, isLoading } = usePlaylistStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        await createPlaylist({ name, description });
        setName("");
        setDescription("");
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-zinc-800">
                    <Plus className="size-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Create Playlist</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Give your playlist a name and description.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium text-zinc-400">Name</label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 focus:ring-zinc-600"
                            placeholder="My Awesome Playlist"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="description" className="text-sm font-medium text-zinc-400">Description (Optional)</label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 focus:ring-zinc-600"
                            placeholder="A collection of my favorite tracks"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="bg-white text-black hover:bg-zinc-200"
                        >
                            {isLoading ? "Creating..." : "Create Playlist"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePlaylistDialog;
