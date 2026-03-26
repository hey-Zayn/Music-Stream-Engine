const { getPublicId, uploadToCloudinary } = require("../lib/cloudinaryHelper");
const { isAdminUser } = require("../middleware/auth.middleware");
const Album = require("../models/album.model");
const Song = require("../models/song.model");
const cloudinary = require("../lib/cloudinary");
const CacheManager = require("../lib/cacheManager");

const getAlbums = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const isUserOnly = req.query.user === "true" && req.auth?.userId;
        const cacheKey = isUserOnly ? `music-app:albums:${req.auth.userId}:${page}:${limit}` : `music-app:albums:global:${page}:${limit}`;

        const responseData = await CacheManager.getOrFetch(cacheKey, 900, async () => {
             const skip = (page - 1) * limit;
             const filter = {};
             
             if (isUserOnly) {
                 filter.creator = req.auth.userId;
             }

             const albums = await Album.find(filter)
                 .sort({ createdAt: -1 })
                 .skip(skip)
                 .limit(limit);

             const total = await Album.countDocuments(filter);

             return {
                 success: true,
                 albums,
                 pagination: {
                     total,
                     page,
                     limit,
                     pages: Math.ceil(total / limit)
                 }
             };
        });

        res.status(200).json({
            ...responseData,
            message: "All Albums"
        })
    } catch (error) {
        next(error);
    }
}
const getAlbumById = async (req, res, next) => {
    try {
        const { albumId } = req.params;
        const album = await Album.findById(albumId).populate("songs");
        if (!album) {
            return res.status(404).json({
                message: "Invaild Data"
            })
        }

        res.status(200).json({
            success: true,
            message: "Album Founded",
            album
        })
    } catch (error) {
        next(error)
    }
}

const createAlbum = async (req, res, next) => {
    try {
        if (!req.files || !req.files.imageFile) {
            return res.status(400).json({ success: false, message: "Image file is required" });
        }

        const { title, artist, releaseYear } = req.body;
        const creator = req.auth.userId;

        if (!title || !artist) {
            return res.status(400).json({ success: false, message: "Title and artist are required" });
        }

        const imageUrl = await uploadToCloudinary(req.files.imageFile, "music-app/albums");

        const album = new Album({
            title,
            artist,
            imageUrl,
            releaseYear: releaseYear || new Date().getFullYear(),
            songs: [],
            creator,
        });

        await album.save();
        res.status(201).json({ success: true, message: "Album created successfully", album });
    } catch (error) {
        next(error);
    }
};

const deleteAlbum = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;

        const album = await Album.findById(id).populate("songs");
        if (!album) {
            return res.status(404).json({ success: false, message: "Album not found" });
        }

        if (album.creator && album.creator !== userId) {
             const isAdmin = await isAdminUser(userId);
             
             if (!isAdmin) {
                return res.status(403).json({ message: "Unauthorized to delete this album" });
             }
        }

        // Delete songs and media
        for (const song of album.songs) {
            try {
                if (song.audioUrl) await cloudinary.uploader.destroy(getPublicId(song.audioUrl), { resource_type: "video" });
                if (song.imageUrl) await cloudinary.uploader.destroy(getPublicId(song.imageUrl));
            } catch (err) {
                console.error("Error deleting song media during album deletion:", err);
            }
        }

        if (album.imageUrl) {
            try {
                await cloudinary.uploader.destroy(getPublicId(album.imageUrl));
            } catch (err) {
                console.error("Error deleting album image:", err);
            }
        }

        await Song.deleteMany({ albumId: id });
        await Album.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Album deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const updateAlbum = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, artist, releaseYear } = req.body;
        const userId = req.auth.userId;

        const album = await Album.findById(id);
        if (!album) return res.status(404).json({ success: false, message: "Album not found" });

        if (album.creator && album.creator !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this album" });
        }

        const updatedData = { title, artist, releaseYear: releaseYear || new Date().getFullYear() };

        if (req.files && req.files.imageFile) {
            if (album.imageUrl) {
                try {
                    await cloudinary.uploader.destroy(getPublicId(album.imageUrl));
                } catch (err) {
                    console.error("Cloudinary old album image deletion failed:", err);
                }
            }
            updatedData.imageUrl = await uploadToCloudinary(req.files.imageFile, "music-app/albums");
        }

        const updatedAlbum = await Album.findByIdAndUpdate(id, updatedData, { new: true });
        res.status(200).json({ success: true, message: "Album updated successfully", album: updatedAlbum });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAlbums,
    getAlbumById,
    createAlbum,
    deleteAlbum,
    updateAlbum,
}