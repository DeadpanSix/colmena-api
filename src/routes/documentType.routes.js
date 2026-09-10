const express = require('express');
const documentTypeController = require('../controllers/documentType.controller');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.get('/', verifyToken, documentTypeController.list);
router.get('/:id', verifyToken, documentTypeController.getById);

router.post('/', verifyToken, requireRole('ADMIN'), documentTypeController.create);
router.put('/:id', verifyToken, requireRole('ADMIN'), documentTypeController.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'), documentTypeController.remove);

module.exports = router;
