import { Music, Album, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoContentProps {
    type: 'songs' | 'albums';
    onActionClick?: () => void;
}

const NoContent = ({ type, onActionClick }: NoContentProps) => {
    const isSongs = type === 'songs';

    return (
        <div className='flex flex-col items-center justify-center py-12 px-4 text-center bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800'>
            <div className='p-4 rounded-full bg-zinc-800/50 mb-4'>
                {isSongs ? (
                    <Music className='size-12 text-zinc-500' />
                ) : (
                    <Album className='size-12 text-zinc-500' />
                )}
            </div>
            <h3 className='text-xl font-semibold mb-2'>
                {isSongs ? "No music found" : "No albums found"}
            </h3>
            <p className='text-zinc-400 max-w-sm mb-6'>
                {isSongs 
                    ? "Your music library is currently empty. Start uploading your favorite tracks!" 
                    : "You haven't created any albums yet. Organize your songs into albums!"}
            </p>
            {onActionClick && (
                <Button 
                    onClick={onActionClick}
                    className='bg-emerald-500 hover:bg-emerald-600 text-white gap-2'
                >
                    <Plus className='size-4' />
                    {isSongs ? "Add Song" : "Create Album"}
                </Button>
            )}
        </div>
    );
};

export default NoContent;
