const express = require('express');
const documentController = require('../controllers/document.controller');
const routingController = require('../controllers/routing.controller');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');
const { upload, verifyAndSaveFile } = require('../middlewares/uploadDocument');

const router = express.Router();

router.get('/', verifyToken, documentController.list);
router.get('/:id', verifyToken, documentController.getById);
router.post('/', verifyToken, upload, verifyAndSaveFile, documentController.create);
router.post('/:id/routing', verifyToken, requireRole('ADMIN'), routingController.addSteps);

module.exports = router;
