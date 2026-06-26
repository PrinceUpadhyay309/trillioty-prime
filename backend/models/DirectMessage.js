const mongoose = require('mongoose');

const DirectMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: false,
    trim: true,
    maxlength: 1000,
  },
  media: {
    type: String, // Base64 data URL or external URL
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DirectMessage', DirectMessageSchema);
