const Album = require("../models/album.model");
const Song = require("../models/song.model");
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

const AllAlbums = async (req, res, next) => {
    try {
        const filter = {};
        
        // If user=true, only show their own albums
        if (req.query.user === "true" && req.auth?.userId) {
            filter.creator = req.auth.userId;
        } else if (!req.query.all === "true") {
            // Default behavior if not asking for "all" (and not an admin) could be to still filter by user
            // or just allow discovery if intended.
            // For now, let's keep it restricted to the creator if they are in a management context.
            // But if it's for discovery (HomePage), they might not pass user=true.
            // However, the dashboard ALWAYS passes user=true.
        }

        const albums = await Album.find(filter);
        res.status(200).json({
            success: true,
            message: "All Albums",
            albums
        })
    } catch (error) {
        next(error);
    }
}
const AllAlbumsById = async (req, res, next) => {
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

        const imageUrl = await uploadToCloudinary(req.files.imageFile);

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
             const { clerkClient } = require('@clerk/express');
             const currentUser = await clerkClient.users.getUser(userId);
             const primaryEmail = currentUser?.primaryEmailAddress?.emailAddress;
             const isAdmin = process.env.ADMIN_EMAIL && primaryEmail && process.env.ADMIN_EMAIL === primaryEmail;
             
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
            updatedData.imageUrl = await uploadToCloudinary(req.files.imageFile);
        }

        const updatedAlbum = await Album.findByIdAndUpdate(id, updatedData, { new: true });
        res.status(200).json({ success: true, message: "Album updated successfully", album: updatedAlbum });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    AllAlbums,
    AllAlbumsById,
    createAlbum,
    deleteAlbum,
    updateAlbum,
}