const express = require('express');
const authController = require('../controllers/auth.controller');
const loginRateLimiter = require('../middlewares/loginRateLimiter');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.post('/login', loginRateLimiter, authController.login);
router.get('/me', verifyToken, authController.me);

module.exports = router;
