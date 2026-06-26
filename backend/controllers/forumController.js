const ForumPost = require('../models/ForumPost');
const User = require('../models/User');

// @desc    Get all forum posts
// @route   GET /api/forums
// @access  Public
exports.getForumPosts = async (req, res) => {
  try {
    const { category, search, sort = '-createdAt', page = 1, limit = 15 } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting overrides for Trending (by upvotes count)
    let sortObj = {};
    if (sort === 'trending') {
      // mongoose doesn't sort by array length easily in basic find,
      // but we can calculate it in aggregate or just sort by upvote count field
      // For simple MERN, sorting by upvotes array length can be done in aggregate,
      // or we can sort by createdAt for now, or use custom aggregation.
      // Let's do aggregation for trending:
      const aggregateQuery = [
        { $match: query },
        {
          $addFields: {
            upvoteCount: { $size: '$upvotes' },
            downvoteCount: { $size: '$downvotes' }
          }
        },
        { $sort: { upvoteCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum }
      ];
      
      const posts = await ForumPost.aggregate(aggregateQuery);
      // Populate author on aggregated docs
      const populatedPosts = await ForumPost.populate(posts, { path: 'author', select: 'name role avatar reputation' });
      const total = await ForumPost.countDocuments(query);

      return res.status(200).json({
        success: true,
        count: populatedPosts.length,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
        },
        data: populatedPosts,
      });
    } else if (sort === 'hype') {
      sortObj = { hypeCount: -1, createdAt: -1 };
    } else {
      sortObj = { createdAt: -1 };
    }

    const total = await ForumPost.countDocuments(query);
    const posts = await ForumPost.find(query)
      .populate('author', 'name role avatar reputation')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: posts.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: posts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single forum post by ID
// @route   GET /api/forums/:id
// @access  Public
exports.getForumPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name role avatar reputation');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Forum post not found' });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a forum post
// @route   POST /api/forums
// @access  Private
exports.createForumPost = async (req, res) => {
  try {
    req.body.author = req.user.id;

    const post = await ForumPost.create(req.body);
    const populated = await post.populate('author', 'name role avatar reputation');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Upvote a forum post
// @route   POST /api/forums/:id/upvote
// @access  Private
exports.toggleUpvote = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user.id;
    const author = await User.findById(post.author);

    const isUpvoted = post.upvotes.includes(userId);
    const isDownvoted = post.downvotes.includes(userId);

    if (isUpvoted) {
      // Remove upvote
      post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
      if (author) author.reputation = Math.max(0, author.reputation - 1);
    } else {
      // Add upvote
      post.upvotes.push(userId);
      if (author) author.reputation += 1;

      // Remove downvote if it exists
      if (isDownvoted) {
        post.downvotes = post.downvotes.filter(id => id.toString() !== userId);
        if (author) author.reputation += 1; // Compensate downvote removal
      }
    }

    await post.save();
    if (author) await author.save();

    res.status(200).json({
      success: true,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Downvote a forum post
// @route   POST /api/forums/:id/downvote
// @access  Private
exports.toggleDownvote = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user.id;
    const author = await User.findById(post.author);

    const isUpvoted = post.upvotes.includes(userId);
    const isDownvoted = post.downvotes.includes(userId);

    if (isDownvoted) {
      // Remove downvote
      post.downvotes = post.downvotes.filter(id => id.toString() !== userId);
      if (author) author.reputation += 1;
    } else {
      // Add downvote
      post.downvotes.push(userId);
      if (author) author.reputation = Math.max(0, author.reputation - 1);

      // Remove upvote if it exists
      if (isUpvoted) {
        post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
        if (author) author.reputation = Math.max(0, author.reputation - 1); // Compensate upvote removal
      }
    }

    await post.save();
    if (author) await author.save();

    res.status(200).json({
      success: true,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete forum post
// @route   DELETE /api/forums/:id
// @access  Private
exports.deleteForumPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Must be owner or Editor/Admin
    if (post.author.toString() !== req.user.id && !['Admin', 'Editor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Discussion deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hype a post (YouTube-style, uses weekly quota)
// @route   POST /api/forums/:id/hype
// @access  Private
exports.toggleHype = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (currentUser.hypesRemaining <= 0) {
      return res.status(400).json({ success: false, message: 'You have run out of weekly Hypes! Resetting next week.' });
    }

    // Decrement hype quota
    currentUser.hypesRemaining -= 1;
    await currentUser.save();

    // Increment post hype count
    post.hypeCount = (post.hypeCount || 0) + 10;
    await post.save();

    // Award reputation to author
    const author = await User.findById(post.author);
    if (author) {
      author.reputation += 10;
      await author.save();
    }

    res.status(200).json({
      success: true,
      hypeCount: post.hypeCount,
      hypesRemaining: currentUser.hypesRemaining,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle repost a post (Twitter-style)
// @route   POST /api/forums/:id/repost
// @access  Private
exports.toggleRepost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user.id;
    const isReposted = post.reposts.includes(userId);

    if (isReposted) {
      post.reposts = post.reposts.filter(id => id.toString() !== userId);
    } else {
      post.reposts.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      reposts: post.reposts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
