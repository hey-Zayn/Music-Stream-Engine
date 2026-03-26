const express = require('express');
const router = express.Router();
const { protectRoute, requireAdmin } = require('../middleware/auth.middleware');
const { createSong, deleteAlbum, createAlbum, deleteSong, checkAdmin } = require('../controllers/admin.controller');



router.get('/check', protectRoute, requireAdmin, checkAdmin);
// Sample route to get all users
// Admin-only deletion/management can be kept here if desired, 
// but creation is now open to all in their respective routes.


module.exports = router;