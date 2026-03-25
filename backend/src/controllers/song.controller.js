const Song = require("../models/song.model");

const getRandomSongs = async (size) => {
    return await Song.aggregate([
        { $sample: { size } },
        {
            $project: {
                _id: 1,
                title: 1,
                artist: 1,
                imageUrl: 1,
                audioUrl: 1,
            }
        }
    ]);
};

const getAllSongs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const songs = await Song.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Song.countDocuments();

        res.status(200).json({
            success: true,
            message: "Songs fetched successfully",
            songs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getSingleSong = async (req, res, next) => {
    try {
        const songs = await getRandomSongs(1);
        res.status(200).json({
            success: true,
            message: "Song fetched successfully",
            songs
        });
    } catch (error) {
        next(error);
    }
};

const getFeaturedSongs = async (req, res, next) => {
    try {
        const songs = await getRandomSongs(8);
        res.status(200).json({
            success: true,
            message: "Featured songs fetched successfully",
            songs
        });
    } catch (error) {
        next(error);
    }
};

const getSongsForYou = async (req, res, next) => {
    try {
        const songs = await getRandomSongs(4);
        res.status(200).json({
            success: true,
            message: "Songs for you fetched successfully",
            songs
        });
    } catch (error) {
        next(error);
    }
};

const getTrendingSongs = async (req, res, next) => {
    try {
        const songs = await getRandomSongs(4);
        res.status(200).json({
            success: true,
            message: "Trending songs fetched successfully",
            songs
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllSongs,
    getFeaturedSongs,
    getSongsForYou,
    getTrendingSongs,
    getSingleSong
};