const Article = require('../models/Article');
const User = require('../models/User');

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
exports.getArticles = async (req, res) => {
  try {
    const { category, type, search, tag, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = { status: 'Published' };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by type (News/Magazine)
    if (type) {
      query.type = type;
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Search by title or summary
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination setup
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .populate('author', 'name role avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: articles.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: articles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get article by slug
// @route   GET /api/articles/:slug
// @access  Public
exports.getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug })
      .populate('author', 'name role avatar bio reputation');

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create article
// @route   POST /api/articles
// @access  Private (Author, Editor, Admin)
exports.createArticle = async (req, res) => {
  try {
    req.body.author = req.user.id;

    // Calculate reading time roughly (e.g., 200 words per minute)
    const wordCount = req.body.content ? req.body.content.split(/\s+/).length : 0;
    req.body.readTime = Math.max(1, Math.ceil(wordCount / 200));

    // If author creates it, default to 'Published' for simplicity in our MERN app,
    // or let it use the body status
    if (!req.body.status) {
      req.body.status = 'Published';
    }

    const article = await Article.create(req.body);

    res.status(201).json({
      success: true,
      data: article,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (Author, Editor, Admin)
exports.updateArticle = async (req, res) => {
  try {
    let article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Make sure user is owner or Editor/Admin
    if (article.author.toString() !== req.user.id && req.user.role === 'Author') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this article' });
    }

    if (req.body.content) {
      const wordCount = req.body.content.split(/\s+/).length;
      req.body.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (Author, Editor, Admin)
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Make sure user is owner or Editor/Admin
    if (article.author.toString() !== req.user.id && req.user.role === 'Author') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this article' });
    }

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Bookmark article
// @route   POST /api/articles/:id/bookmark
// @access  Private
exports.toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const articleId = req.params.id;

    const isBookmarked = user.bookmarks.includes(articleId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== articleId);
    } else {
      user.bookmarks.push(articleId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      isBookmarked: !isBookmarked,
      message: isBookmarked ? 'Bookmark removed' : 'Article bookmarked',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
