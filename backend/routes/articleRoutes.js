const express = require('express');
const {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleBookmark,
} = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getArticles)
  .post(protect, authorize('Author', 'Editor', 'Admin'), createArticle);

router.route('/:id')
  .put(protect, authorize('Author', 'Editor', 'Admin'), updateArticle)
  .delete(protect, authorize('Author', 'Editor', 'Admin'), deleteArticle);

router.get('/post/:slug', getArticleBySlug);
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
