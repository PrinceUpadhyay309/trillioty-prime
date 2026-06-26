const express = require('express');
const { getChatMessages, createChatMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getChatMessages)
  .post(protect, createChatMessage);

module.exports = router;
