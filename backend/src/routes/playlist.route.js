const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/auth.middleware');
const {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
} = require('../controllers/playlist.controller');

router.use(protectRoute);

router.post('/', createPlaylist);
router.get('/', getUserPlaylists);
router.get('/:id', getPlaylistById);
router.put('/:id', updatePlaylist);
router.delete('/:id', deletePlaylist);
router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id/songs/:songId', removeSongFromPlaylist);

module.exports = router;
