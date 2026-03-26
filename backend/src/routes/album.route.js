const express = require('express');
const { getAlbums, getAlbumById, createAlbum, deleteAlbum, updateAlbum } = require("../controllers/album.controller");
const { protectRoute } = require("../middleware/auth.middleware");
const router = express.Router();

// Sample route to get all users
// Protected route to fetch albums; supports filtering by ?user=true
router.get('/', protectRoute, getAlbums);
router.get('/:albumId', getAlbumById);
router.post("/", protectRoute, createAlbum);
router.put("/:id", protectRoute, updateAlbum);
router.delete("/:id", protectRoute, deleteAlbum);


module.exports = router;