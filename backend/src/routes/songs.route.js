const express = require('express');
const { getAllSongs, getSongsForYou, getFeaturedSongs, getTrendingSongs, getSingleSong, createSong, deleteSong, updateSong } = require('../controllers/song.controller');
const { protectRoute } = require('../middleware/auth.middleware');
const router = express.Router();

// Sample route to get all users
router.get('/', protectRoute, getAllSongs);
router.get('/featured', getFeaturedSongs);
router.get('/made-for-you', getSongsForYou);
router.get('/trending', getTrendingSongs);
router.get('/single', getSingleSong);

router.post('/', protectRoute, createSong);
router.put('/:id', protectRoute, updateSong);
router.delete('/:id', protectRoute, deleteSong);


module.exports = router;