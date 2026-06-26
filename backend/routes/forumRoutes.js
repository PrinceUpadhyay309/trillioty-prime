const express = require('express');
const {
  getForumPosts,
  getForumPostById,
  createForumPost,
  toggleUpvote,
  toggleDownvote,
  deleteForumPost,
  toggleHype,
  toggleRepost,
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getForumPosts)
  .post(protect, createForumPost);

router.route('/:id')
  .get(getForumPostById)
  .delete(protect, deleteForumPost);

router.post('/:id/upvote', protect, toggleUpvote);
router.post('/:id/downvote', protect, toggleDownvote);
router.post('/:id/hype', protect, toggleHype);
router.post('/:id/repost', protect, toggleRepost);

module.exports = router;
