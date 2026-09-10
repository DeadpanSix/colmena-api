const express = require('express');
const teamController = require('../controllers/team.controller');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.get('/', verifyToken, teamController.list);
router.get('/:id', verifyToken, teamController.getById);

router.post('/', verifyToken, requireRole('ADMIN'), teamController.create);
router.put('/:id', verifyToken, requireRole('ADMIN'), teamController.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'), teamController.remove);

module.exports = router;
