const Comment = require('../models/Comment');
const ForumPost = require('../models/ForumPost');
const User = require('../models/User');

// @desc    Get comments for an article
// @route   GET /api/comments/article/:articleId
// @access  Public
exports.getCommentsByArticle = async (req, res) => {
  try {
    const comments = await Comment.find({ articleId: req.params.articleId })
      .populate('author', 'name avatar role reputation')
      .sort({ createdAt: 1 }); // Oldest first (chronological thread)

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get comments for a forum post
// @route   GET /api/comments/post/:postId
// @access  Public
exports.getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('author', 'name avatar role reputation')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a comment or reply
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { content, articleId, postId, parentId } = req.body;
    const author = req.user.id;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Please add comment content' });
    }

    const comment = await Comment.create({
      content,
      author,
      articleId: articleId || null,
      postId: postId || null,
      parentId: parentId || null,
    });

    // If it's a forum post comment, increment commentsCount on the post
    if (postId) {
      await ForumPost.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    }

    const populated = await comment.populate('author', 'name avatar role reputation');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Upvote for a comment
// @route   POST /api/comments/:id/upvote
// @access  Private
exports.toggleCommentUpvote = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const userId = req.user.id;
    const author = await User.findById(comment.author);

    const isUpvoted = comment.upvotes.includes(userId);

    if (isUpvoted) {
      comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId);
      if (author) author.reputation = Math.max(0, author.reputation - 1);
    } else {
      comment.upvotes.push(userId);
      if (author) author.reputation += 1;
    }

    await comment.save();
    if (author) await author.save();

    res.status(200).json({
      success: true,
      upvotes: comment.upvotes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Check ownership or role
    if (comment.author.toString() !== req.user.id && !['Admin', 'Editor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    // Decrement post commentsCount if it's on a forum post
    if (comment.postId) {
      await ForumPost.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });
    }

    // Delete all child replies too
    await Comment.deleteMany({ parentId: comment._id });

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment and nested replies deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
