const express = require('express');
const {
  getCommentsByArticle,
  getCommentsByPost,
  createComment,
  toggleCommentUpvote,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/upvote', protect, toggleCommentUpvote);

router.get('/article/:articleId', getCommentsByArticle);
router.get('/post/:postId', getCommentsByPost);

module.exports = router;
