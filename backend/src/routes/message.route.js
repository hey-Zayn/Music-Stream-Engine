const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getMessages,
    getUnreadCount
} = require('../controllers/message.controller');

const { protectRoute } = require('../middleware/auth.middleware');

// Send message
router.post('/send', protectRoute, sendMessage);

// Get messages with a user
// router.get('/:userId', getMessages);

// Get unread count
router.get('/unread/count', getUnreadCount);

module.exports = router;