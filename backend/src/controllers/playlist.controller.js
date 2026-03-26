const Playlist = require("../models/playlist.model");
const Song = require("../models/song.model");

const createPlaylist = async (req, res, next) => {
    try {
        const { name, description, imageUrl } = req.body;
        const creator = req.auth.userId;

        if (!name) {
            return res.status(400).json({ message: "Playlist name is required" });
        }

        const playlist = new Playlist({
            name,
            description,
            imageUrl,
            creator,
            songs: [],
        });

        await playlist.save();
        res.status(201).json(playlist);
    } catch (error) {
        next(error);
    }
};

const getUserPlaylists = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const playlists = await Playlist.find({ creator: userId }).populate("songs");
        res.status(200).json(playlists);
    } catch (error) {
        next(error);
    }
};

const getPlaylistById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const playlist = await Playlist.findById(id).populate("songs");

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        res.status(200).json(playlist);
    } catch (error) {
        next(error);
    }
};

const updatePlaylist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, imageUrl, songs } = req.body;
        const userId = req.auth.userId;

        const playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.creator !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this playlist" });
        }

        if (name) playlist.name = name;
        if (description !== undefined) playlist.description = description;
        if (imageUrl) playlist.imageUrl = imageUrl;
        if (songs) playlist.songs = songs; // This handles reordering

        await playlist.save();
        res.status(200).json(playlist);
    } catch (error) {
        next(error);
    }
};

const deletePlaylist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;

        const playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.creator !== userId) {
            return res.status(403).json({ message: "Unauthorized to delete this playlist" });
        }

        await Playlist.findByIdAndDelete(id);
        res.status(200).json({ message: "Playlist deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const addSongToPlaylist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { songId } = req.body;
        const userId = req.auth.userId;

        const playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.creator !== userId) {
            return res.status(403).json({ message: "Unauthorized to modify this playlist" });
        }

        if (playlist.songs.includes(songId)) {
            return res.status(400).json({ message: "Song already in playlist" });
        }

        playlist.songs.push(songId);
        await playlist.save();

        const updatedPlaylist = await Playlist.findById(id).populate("songs");
        res.status(200).json(updatedPlaylist);
    } catch (error) {
        next(error);
    }
};

const removeSongFromPlaylist = async (req, res, next) => {
    try {
        const { id, songId } = req.params;
        const userId = req.auth.userId;

        const playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.creator !== userId) {
            return res.status(403).json({ message: "Unauthorized to modify this playlist" });
        }

        playlist.songs = playlist.songs.filter(s => s.toString() !== songId);
        await playlist.save();

        const updatedPlaylist = await Playlist.findById(id).populate("songs");
        res.status(200).json(updatedPlaylist);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
};
