const Song = require("../models/song.model");
const User = require("../models/user.model");
const Album = require("../models/album.model");
const CacheManager = require("../lib/cacheManager");

const getStats = async (req, res, next) => {
    try {


        const isUserOnly = req.query.user === "true";
        const cacheKey = isUserOnly ? `music-app:stats:${req.auth.userId}` : "music-app:stats:global";

        const stats = await CacheManager.getOrFetch(cacheKey, 600, async () => {
            const filter = {};
            if (isUserOnly) {
                filter.creator = req.auth.userId;
            }

            const [totalSongs, totalUsers, totalAlbums, uniqueArtists] = await Promise.all([
                Song.countDocuments(filter),
                User.countDocuments(),
                Album.countDocuments(filter),
                Song.aggregate([
                    { $match: filter },
                    {
                        $group: {
                            _id: "$artist",
                        },
                    },
                    {
                        $count: "count",
                    },
                ]),
            ]);

            return {
                totalAlbums,
                totalSongs,
                totalUsers,
                totalArtists: uniqueArtists[0]?.count || 0,
            };
        });

        res.status(200).json(stats);

    } catch (error) {

    }
}


module.exports = {
    getStats
}

