import { useAlbumStore } from "@/store/useAlbumStore";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Clock, Pause, Play } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import AddToPlaylistDialog from "@/components/playlist/AddToPlaylistDialog";
import { Skeleton } from "@/components/ui/skeleton";

const ALBUM_THEMES = [
  { name: "Emerald", from: "from-emerald-900/80" },
  { name: "Royal Blue", from: "from-blue-900/80" },
  { name: "Deep Ruby", from: "from-rose-900/80" },
  { name: "Golden Amber", from: "from-amber-900/80" },
  { name: "Midnight Purple", from: "from-violet-900/80" },
  { name: "Deep Forest", from: "from-teal-900/80" },
  { name: "Crimson Red", from: "from-red-900/80" },
  { name: "Midnight Indigo", from: "from-indigo-900/80" },
  { name: "Luxury Pink", from: "from-pink-900/80" },
  { name: "Royal Gold", from: "from-yellow-900/80" },
  { name: "Ocean Deep", from: "from-cyan-900/80" },
  { name: "Deep Mint", from: "from-green-900/80" },
  { name: "Desert Sand", from: "from-orange-900/80" },
  { name: "Nordic Frost", from: "from-sky-900/80" },
  { name: "Mystic Plum", from: "from-fuchsia-900/80" },
  { name: "Deep Ochre", from: "from-amber-800/80" },
  { name: "Velvet Grape", from: "from-purple-900/80" },
];

const getAlbumTheme = (id: string) => {
  if (!id) return ALBUM_THEMES[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % ALBUM_THEMES.length;
  return ALBUM_THEMES[index];
};

const AlbumPage = () => {
  // const isPlaying = false;

  const { albumId } = useParams();
  const { isLoading, fetchAlbumById, currentAlbum } = useAlbumStore();
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
  useEffect(() => {
    if (albumId) fetchAlbumById(albumId);
  }, [fetchAlbumById, albumId]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes} : ${remainingSeconds.toString().padStart(2, "0")} `;
  };

  if (isLoading) {
    return (
      <div className="h-full">
        <ScrollArea className="h-full rounded-md">
          <div className="relative min-h-screen">
            <div className="absolute inset-0 bg-zinc-900/50 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6 pb-8 items-center sm:items-start text-center sm:text-left">
                <Skeleton className="w-[120px] h-[120px] sm:w-[240px] sm:h-[240px] rounded" />
                <div className="flex flex-col justify-end gap-3">
                  <Skeleton className="h-4 w-16 mx-auto sm:mx-0" />
                  <Skeleton className="h-12 sm:h-16 w-[200px] sm:w-[400px]" />
                  <Skeleton className="h-4 w-32 mt-2 mx-auto sm:mx-0" />
                </div>
              </div>
              <div className="px-6 pb-4 flex items-center gap-6">
                <Skeleton className="w-14 h-14 rounded-full" />
              </div>
              <div className="bg-black/20 backdrop-blur-sm">
                <div className="px-6 py-4 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[minmax(0,1fr)_40px] sm:grid-cols-[16px_minmax(0,4fr)_2fr_120px_40px] gap-4 px-4 py-2 border-b border-white/5"
                    >
                      <Skeleton className="h-4 w-4 hidden sm:block" />
                      <div className="flex items-center gap-3 w-full">
                        <Skeleton className="size-10 shrink-0" />
                        <div className="space-y-2 w-full max-w-[200px]">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-24 hidden sm:flex items-center" />
                      <Skeleton className="h-4 w-10 hidden sm:flex items-center" />
                      <Skeleton className="size-6 rounded-full shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  const handlePlayAlbum = () => {
    if (!currentAlbum) return;

    const isCurrentAlbumPlaying = currentAlbum?.songs.some(
      (song) => song._id === currentSong?._id,
    );
    if (isCurrentAlbumPlaying) togglePlay();
    else {
      // start playing the album from the beginning
      playAlbum(currentAlbum?.songs, 0);
    }
  };

  const handlePlaySong = (index: number) => {
    if (!currentAlbum) return;
    playAlbum(currentAlbum?.songs, index);
  };
  const albumTheme = getAlbumTheme(albumId || "");

  return (
    <div className="h-full">
      <ScrollArea className="h-full rounded-md">
        <div className="relative min-h-screen">
          <div
            className={`absolute inset-0 bg-linear-to-b ${albumTheme.from} via-zinc-900 to-black`}
            aria-hidden="true"
          >
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6 pb-8 items-center sm:items-start text-center sm:text-left">
                <img
                  src={currentAlbum?.imageUrl}
                  alt={currentAlbum?.title}
                  className="w-[150px] h-[150px] sm:w-[240px] sm:h-[240px] shadow-xl rounded"
                />
                <div className="flex flex-col justify-end mt-4 sm:mt-0">
                  <p className="text-sm font-medium">Album</p>
                  <h1 className="text-4xl sm:text-7xl font-bold my-2 sm:my-4 line-clamp-2">
                    {currentAlbum?.title}
                  </h1>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-zinc-100 flex-wrap">
                    <span className="font-medium text-white">
                      {currentAlbum?.artist}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>{currentAlbum?.songs.length} songs</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{currentAlbum?.releaseYear}</span>
                  </div>
                </div>
              </div>

              {/* Controls - Section */}
              <div className="px-6 pb-4 flex items-center gap-6">
                <Button
                  onClick={handlePlayAlbum}
                  size="icon"
                  className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 
                hover:scale-105 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7 text-black" />
                  ) : (
                    <Play className="h-7 w-7 text-black" />
                  )}
                </Button>
              </div>

              <div className="bg-black/20 backdrop-blur-sm ">
                {/* table header */}
                <div
                  className="grid grid-cols-[minmax(0,1fr)_40px] sm:grid-cols-[16px_minmax(0,4fr)_2fr_1fr] gap-4 px-4 sm:px-10 py-2 text-sm 
            text-zinc-400 border-b border-white/5"
                >
                  <div className="hidden sm:block">#</div>
                  <div>Title</div>
                  <div className="hidden sm:block">Released Date</div>
                  <div className="hidden sm:flex items-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="w-8"></div>
                </div>

                <div className="px-2 sm:px-6">
                  <div className="space-y-2 py-4">
                    {currentAlbum?.songs.map((song, index) => {
                      const isCurrentSong = currentSong?._id === song._id;
                      return (
                        <div
                          key={song._id}
                          onClick={() => handlePlaySong(index)}
                          className={`grid grid-cols-[minmax(0,1fr)_40px] sm:grid-cols-[16px_minmax(0,4fr)_2fr_120px_40px] gap-2 sm:gap-4 px-2 sm:px-4 py-2 text-sm
                                                      text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer
                                                      `}
                        >
                          <div className="hidden sm:flex items-center justify-center">
                            {isCurrentSong && isPlaying ? (
                              <span className="group-hover: text-green-500">
                                ♫
                              </span>
                            ) : (
                              <span className="group-hover:hidden">
                                {index + 1}
                              </span>
                            )}
                            {!isCurrentSong && (
                              <Play className="h-4 w-4 hidden group-hover:block" />
                            )}
                          </div>

                          <div className="flex flex-row items-center gap-3 overflow-hidden">
                            <img
                              src={song.imageUrl}
                              alt={song.title}
                              className="size-10 shrink-0 rounded"
                            />
                            <div className="min-w-0">
                              <div
                                className={`font-medium text-white truncate`}
                              >
                                {song.title}
                              </div>
                              <div className="truncate">{song.artist}</div>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center truncate">
                            {song.createdAt.split("T")[0]}
                          </div>
                          <div className="hidden sm:flex items-center truncate">
                            {formatDuration(song.duration)}
                          </div>
                          <div
                            className="flex items-center justify-end shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <AddToPlaylistDialog songId={song._id} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default AlbumPage;
