const express = require('express');
const authController = require('../controllers/auth.controller');
const loginRateLimiter = require('../middlewares/loginRateLimiter');

const router = express.Router();

router.post('/login', loginRateLimiter, authController.login);

module.exports = router;
