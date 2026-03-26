const clerk = require('@clerk/express');
const Song = require("../models/song.model");
const Album = require("../models/album.model");
const { getPublicId, uploadToCloudinary } = require("../lib/cloudinaryHelper");
const CacheManager = require("../lib/cacheManager");



const createSong = async (req, res, next) => {
  try {
    if (!req.files || !req.files.audioFile || !req.files.imageFile) {
      return res.status(400).json({
        success: false,
        message: "Please upload both audio and image files"
      });
    }

    const { title, artist, albumId, duration } = req.body;
    
    // Validate required fields
    if (!title || !artist || !duration) {
      return res.status(400).json({
        success: false,
        message: "Title, artist, and duration are required"
      });
    }

    const audioFile = req.files.audioFile;
    const imageFile = req.files.imageFile;

    const audioUrl = await uploadToCloudinary(audioFile, "music-app/songs");
    const imageUrl = await uploadToCloudinary(imageFile, "music-app/songs");

    const song = new Song({
      title,
      artist,
      audioUrl,
      imageUrl,
      duration: parseInt(duration),
      albumId: albumId || null,
    });
    
    await song.save();
    
    if (albumId) {
      await Album.findByIdAndUpdate(albumId, {
        $push: { songs: song._id },
      }, { new: true });
    }

    // Invalidate caches
    await CacheManager.del("music-app:stats:global");
    if (song.creator) await CacheManager.del(`music-app:stats:${song.creator}`);
    await CacheManager.del(["music-app:songs:featured", "music-app:songs:for-you", "music-app:songs:trending"]);
    await CacheManager.purgePattern("music-app:albums:*"); // Clear any album listings as they may change counts or content

    res.status(201).json({
      success: true,
      message: "Song created successfully",
      song
    });
  } catch (err) {
    console.error("Error in createSong:", err);
    next(err);
  }
};

const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;

    const song = await Song.findById(id);
    
    if (!song) {
      return res.status(404).json({ 
        success: false,
        message: "Song not found" 
      });
    }

    // Delete files from Cloudinary
    try {
      if (song.audioUrl) {
        const audioPublicId = getPublicId(song.audioUrl);
        await cloudinary.uploader.destroy(audioPublicId, { resource_type: "video" }); // audio is "video" in Cloudinary
      }
      if (song.imageUrl) {
        const imagePublicId = getPublicId(song.imageUrl);
        await cloudinary.uploader.destroy(imagePublicId);
      }
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion failed:", cloudinaryError);
    }

    if (song.albumId) {
      await Album.findByIdAndUpdate(song.albumId, {
        $pull: { songs: song._id },
      }, { new: true });
    }

    await Song.findByIdAndDelete(id);

    // Invalidate caches
    await CacheManager.del("music-app:stats:global");
    if (song.creator) await CacheManager.del(`music-app:stats:${song.creator}`);
    await CacheManager.del(["music-app:songs:featured", "music-app:songs:for-you", "music-app:songs:trending"]);
    await CacheManager.purgePattern("music-app:albums:*");

    res.status(200).json({ 
      success: true,
      message: "Song and associated media deleted successfully" 
    });
  } catch (error) {
    console.error("Error in deleteSong:", error);
    next(error);
  }
};

const createAlbum = async (req, res, next) => {
  try {
    if (!req.files || !req.files.imageFile) {
      return res.status(400).json({ 
        success: false,
        message: "Image file is required" 
      });
    }

    const { title, artist, releaseYear } = req.body;
    
    if (!title || !artist) {
      return res.status(400).json({
        success: false,
        message: "Title and artist are required"
      });
    }

    const imageFile = req.files.imageFile;
    const imageUrl = await uploadToCloudinary(imageFile, "music-app/albums");

    const album = new Album({
      title,
      artist,
      imageUrl,
      releaseYear: releaseYear || new Date().getFullYear(),
      songs: [] // Initialize empty songs array
    });

    await album.save();

    // Invalidate caches
    await CacheManager.del("music-app:stats:global");
    if (album.creator) await CacheManager.del(`music-app:stats:${album.creator}`);
    await CacheManager.purgePattern("music-app:albums:*");

    res.status(201).json({
      success: true,
      message: "Album created successfully",
      album
    });
  } catch (error) {
    console.error("Error in createAlbum:", error);
    next(error);
  }
};

const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const album = await Album.findById(id).populate("songs");
    if (!album) {
      return res.status(404).json({ 
        success: false,
        message: "Album not found" 
      });
    }

    // Delete all songs media from Cloudinary
    for (const song of album.songs) {
      try {
        if (song.audioUrl) {
          await cloudinary.uploader.destroy(getPublicId(song.audioUrl), { resource_type: "video" });
        }
        if (song.imageUrl) {
          await cloudinary.uploader.destroy(getPublicId(song.imageUrl));
        }
      } catch (err) {
        console.error("Error deleting song media during album deletion:", err);
      }
    }

    // Delete album image from Cloudinary
    try {
      if (album.imageUrl) {
        await cloudinary.uploader.destroy(getPublicId(album.imageUrl));
      }
    } catch (err) {
      console.error("Error deleting album image:", err);
    }
    
    await Song.deleteMany({ albumId: id });
    await Album.findByIdAndDelete(id);
    
    // Invalidate caches
    await CacheManager.del("music-app:stats:global");
    if (album.creator) await CacheManager.del(`music-app:stats:${album.creator}`);
    await CacheManager.del(["music-app:songs:featured", "music-app:songs:for-you", "music-app:songs:trending"]);
    await CacheManager.purgePattern("music-app:albums:*");
    
    res.status(200).json({ 
      success: true,
      message: "Album and all associated music and files deleted successfully" 
    });
  } catch (error) {
    console.error("Error in deleteAlbum:", error);
    next(error);
  }
};

const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        admin: false, 
        message: "Unauthorized" 
      });
    }

    // Final security check for the admin flag
    const currentUser = await clerk.clerkClient.users.getUser(userId);
    const primaryEmail = currentUser?.primaryEmailAddress?.emailAddress;
    const isAdmin = process.env.ADMIN_EMAIL && primaryEmail && process.env.ADMIN_EMAIL === primaryEmail;

    if (!isAdmin) {
      return res.status(200).json({
        success: true,
        admin: false,
        message: "You are not an admin"
      });
    }

    res.status(200).json({ 
      success: true,
      admin: true, 
      userId: userId 
    });
    
  } catch (error) {
    console.error("Error in checkAdmin:", error);
    next(error);
  }
};

module.exports = {
  createSong,
  deleteSong,
  createAlbum,
  deleteAlbum,
  checkAdmin
};