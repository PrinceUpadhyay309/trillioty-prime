const mongoose = require('mongoose');

const ForumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  content: {
    type: String,
    required: [true, 'Please add post content'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  downvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Tech', 'Politics', 'Business', 'Culture', 'Sports', 'National', 'General'],
    default: 'General',
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  commentsCount: {
    type: Number,
    default: 0,
  },
  hypeCount: {
    type: Number,
    default: 0,
  },
  reposts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  media: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ForumPost', ForumPostSchema);
