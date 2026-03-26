import { useMusicStore } from '@/store/useMusicStore';
import StatsCard from './StatsCard';
import { Library, ListMusic, Users2 } from "lucide-react";


const DashboardStats = () => {
  const { stats, isLoading } = useMusicStore();

  if (isLoading || !stats) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-pulse'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='h-24 bg-zinc-800/50 rounded-lg border border-zinc-800' />
        ))}
      </div>
    );
  }

  const statsData = [
    {
      icon: ListMusic,
      label: "Your Songs",
      value: stats.totalSongs.toString(),
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      icon: Library,
      label: "Your Albums",
      value: stats.totalAlbums.toString(),
      bgColor: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
    {
      icon: Users2,
      label: "Your Artists",
      value: stats.totalArtists.toString(),
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
  ];
  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 '>
        {statsData.map((stat) => (
          <StatsCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            bgColor={stat.bgColor}
            iconColor={stat.iconColor}
          />
        ))}
      </div>
    </div>
  )
}

export default DashboardStats