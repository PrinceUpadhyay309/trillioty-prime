const ChatMessage = require('../models/ChatMessage');

// @desc    Get latest 50 chat messages
// @route   GET /api/chat
// @access  Public
exports.getChatMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find()
      .populate('user', 'name avatar role reputation headline')
      .sort({ createdAt: -1 })
      .limit(50);

    // Return in chronological order
    res.status(200).json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post a chat message
// @route   POST /api/chat
// @access  Private
exports.createChatMessage = async (req, res) => {
  try {
    const { message, media } = req.body;

    if ((!message || !message.trim()) && !media) {
      return res.status(400).json({ success: false, message: 'Message content or media is required' });
    }

    const chatMsg = await ChatMessage.create({
      user: req.user.id,
      message: message ? message.trim() : '',
      media: media || undefined,
    });

    const populated = await chatMsg.populate('user', 'name avatar role reputation headline');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
