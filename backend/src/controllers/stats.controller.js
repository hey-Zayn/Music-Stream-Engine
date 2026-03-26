const Song = require("../models/song.model");
const User = require("../models/user.model");
const Album = require("../models/album.model");

const getStats = async (req, res, next) => {
    try {


        const filter = {};
        if (req.query.user === "true") {
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

        res.status(200).json({
            totalAlbums,
            totalSongs,
            totalUsers,
            totalArtists: uniqueArtists[0]?.count || 0,
        });

    } catch (error) {

    }
}


module.exports = {
    getStats
}

