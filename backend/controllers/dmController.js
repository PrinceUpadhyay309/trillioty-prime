const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');

// @desc    Get all active DM conversations (contact list)
// @route   GET /api/dm
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const myId = req.user.id;
    
    // Find all DMs involving current user
    const messages = await DirectMessage.find({
      $or: [{ sender: myId }, { recipient: myId }]
    })
    .populate('sender recipient', 'name avatar role reputation headline')
    .sort({ createdAt: -1 });

    const contactsMap = {};
    messages.forEach((msg) => {
      if (!msg.sender || !msg.recipient) return;
      const contact = msg.sender._id.toString() === myId ? msg.recipient : msg.sender;
      const contactId = contact._id.toString();
      
      // Keep only the most recent message info if needed, but for contact list we just map the user details
      if (!contactsMap[contactId]) {
        contactsMap[contactId] = contact;
      }
    });

    res.status(200).json({
      success: true,
      data: Object.values(contactsMap),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get 1-to-1 message history with a user
// @route   GET /api/dm/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const targetId = req.params.userId;

    const messages = await DirectMessage.find({
      $or: [
        { sender: myId, recipient: targetId },
        { sender: targetId, recipient: myId }
      ]
    })
    .populate('sender recipient', 'name avatar role reputation headline')
    .sort({ createdAt: 1 }); // chronological order

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a 1-to-1 message
// @route   POST /api/dm/:userId
// @access  Private
exports.createMessage = async (req, res) => {
  try {
    const myId = req.user.id;
    const targetId = req.params.userId;
    const { message, media } = req.body;

    if ((!message || !message.trim()) && !media) {
      return res.status(400).json({ success: false, message: 'Message content or media is required' });
    }

    const dm = await DirectMessage.create({
      sender: myId,
      recipient: targetId,
      message: message ? message.trim() : '',
      media: media || undefined,
    });

    const populated = await dm.populate('sender recipient', 'name avatar role reputation headline');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
