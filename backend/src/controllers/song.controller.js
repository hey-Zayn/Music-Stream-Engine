const Song = require("../models/song.model");
const Album = require("../models/album.model");
const cloudinary = require("../lib/cloudinary");

const getPublicId = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  const fileName = parts.pop();
  const publicId = fileName.split(".")[0];
  return publicId;
};

const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (err) {
    console.log("Error in uploadToCloudinary:", err);
    throw new Error(err.message || "Cloudinary upload failed");
  }
};

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

        const filter = {};
        if (req.query.user === "true" && req.auth?.userId) {
            filter.creator = req.auth.userId;
        }

        const songs = await Song.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Song.countDocuments(filter);

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

const createSong = async (req, res, next) => {
    try {
        if (!req.files || !req.files.audioFile || !req.files.imageFile) {
            return res.status(400).json({
                success: false,
                message: "Please upload both audio and image files"
            });
        }

        const { title, artist, albumId, duration } = req.body;
        const creator = req.auth.userId;

        if (!title) return res.status(400).json({ success: false, message: "Title is required" });
        if (!artist) return res.status(400).json({ success: false, message: "Artist is required" });
        if (!duration) return res.status(400).json({ success: false, message: "Duration is required" });

        const audioUrl = await uploadToCloudinary(req.files.audioFile);
        const imageUrl = await uploadToCloudinary(req.files.imageFile);

        const song = new Song({
            title,
            artist,
            audioUrl,
            imageUrl,
            duration: parseInt(duration),
            albumId: albumId || null,
            creator,
        });

        await song.save();

        if (albumId) {
            const album = await Album.findById(albumId);
            if (!album || (album.creator && album.creator !== creator)) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized or invalid album"
                });
            }

            await Album.findByIdAndUpdate(albumId, {
                $push: { songs: song._id },
            }, { new: true });
        }

        res.status(201).json({
            success: true,
            message: "Song created successfully",
            song
        });
    } catch (error) {
        next(error);
    }
};

const deleteSong = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;

        const song = await Song.findById(id);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        // Check if user is creator or admin (admin check can be added if needed)
        // For now, only creator can delete their song if they are not an admin
        // Actually, the user rules say "everyone can upload", but usually we want some restriction on deletion.
        // I'll allow the creator to delete.
        if (song.creator && song.creator !== userId) {
             // We can check admin status here too if we want to allow admins to delete anything
             const { clerkClient } = require('@clerk/express');
             const currentUser = await clerkClient.users.getUser(userId);
             const primaryEmail = currentUser?.primaryEmailAddress?.emailAddress;
             const isAdmin = process.env.ADMIN_EMAIL && primaryEmail && process.env.ADMIN_EMAIL === primaryEmail;
             
             if (!isAdmin) {
                return res.status(403).json({ message: "Unauthorized to delete this song" });
             }
        }

        // Delete from Cloudinary
        try {
            if (song.audioUrl) {
                await cloudinary.uploader.destroy(getPublicId(song.audioUrl), { resource_type: "video" });
            }
            if (song.imageUrl) {
                await cloudinary.uploader.destroy(getPublicId(song.imageUrl));
            }
        } catch (err) {
            console.error("Cloudinary deletion failed:", err);
        }

        if (song.albumId) {
            await Album.findByIdAndUpdate(song.albumId, {
                $pull: { songs: song._id },
            });
        }

        await Song.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Song deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const updateSong = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, artist, duration, albumId } = req.body;
        const userId = req.auth.userId;

        const song = await Song.findById(id);
        if (!song) return res.status(404).json({ message: "Song not found" });

        // Only creator can update
        if (song.creator && song.creator !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this song" });
        }

        const updatedData = { title, artist, duration: parseInt(duration), albumId: albumId || null };
        
        if (req.files && req.files.imageFile) {
            // Delete old image if exists
            if (song.imageUrl) {
                try {
                    await cloudinary.uploader.destroy(getPublicId(song.imageUrl));
                } catch (err) {
                    console.error("Cloudinary old image deletion failed:", err);
                }
            }
            updatedData.imageUrl = await uploadToCloudinary(req.files.imageFile);
        }

        const updatedSong = await Song.findByIdAndUpdate(id, updatedData, { new: true });
        res.status(200).json({ success: true, message: "Song updated successfully", song: updatedSong });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllSongs,
    getFeaturedSongs,
    getSongsForYou,
    getTrendingSongs,
    getSingleSong,
    createSong,
    deleteSong,
    updateSong,
};