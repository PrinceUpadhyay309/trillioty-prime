const express = require('express');
const { getConversations, getMessages, createMessage } = require('../controllers/dmController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getConversations);

router.route('/:userId')
  .get(protect, getMessages)
  .post(protect, createMessage);

module.exports = router;
