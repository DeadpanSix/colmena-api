const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.get('/summary', verifyToken, requireRole('ADMIN'), dashboardController.getSummary);
router.get('/team/:teamId', verifyToken, dashboardController.getTeamDashboard);

module.exports = router;
