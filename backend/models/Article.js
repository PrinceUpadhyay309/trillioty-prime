const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  summary: {
    type: String,
    required: [true, 'Please add a summary'],
    trim: true,
  },
  content: {
    type: String, // Storing article content as HTML string or Markdown text
    required: [true, 'Please add article content'],
  },
  bannerImage: {
    type: String,
    required: [true, 'Please add a banner image URL'],
    default: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['News', 'Magazine'],
    required: [true, 'Please specify the type (News or Magazine)'],
  },
  category: {
    type: String,
    enum: ['Tech', 'Politics', 'Business', 'Culture', 'Sports', 'National'],
    required: [true, 'Please specify a category'],
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  views: {
    type: Number,
    default: 0,
  },
  readTime: {
    type: Number,
    default: 3, // in minutes
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Draft', 'Review', 'Published'],
    default: 'Draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create article slug from the title before saving
ArticleSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove non-word chars
      .replace(/[\s_-]+/g, '-') // swap spaces/underscores for single hyphen
      .replace(/^-+|-+$/g, ''); // trim hyphens
  }
});

module.exports = mongoose.model('Article', ArticleSchema);
