const express = require('express');
const { register, login, getMe, updateProfile, toggleFollow, getUserById } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/follow/:id', protect, toggleFollow);
router.get('/user/:id', getUserById);

module.exports = router;
