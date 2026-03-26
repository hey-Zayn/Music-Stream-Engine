const express = require('express');
const { AllAlbums, AllAlbumsById, createAlbum, deleteAlbum, updateAlbum } = require("../controllers/album.controller");
const { protectRoute } = require("../middleware/auth.middleware");
const router = express.Router();

// Sample route to get all users
// Protected route to fetch albums; supports filtering by ?user=true
router.get('/', protectRoute, AllAlbums);
router.get('/:albumId', AllAlbumsById);
router.post("/", protectRoute, createAlbum);
router.put("/:id", protectRoute, updateAlbum);
router.delete("/:id", protectRoute, deleteAlbum);


module.exports = router;