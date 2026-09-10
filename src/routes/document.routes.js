const express = require('express');
const documentController = require('../controllers/document.controller');
const routingController = require('../controllers/routing.controller');
const responseController = require('../controllers/response.controller');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');
const { upload, verifyAndSaveFile } = require('../middlewares/uploadDocument');

const router = express.Router();

router.get('/', verifyToken, documentController.list);
router.get('/:id', verifyToken, documentController.getById);
router.post('/', verifyToken, upload, verifyAndSaveFile, documentController.create);
router.post('/:id/routing', verifyToken, requireRole('ADMIN'), routingController.addSteps);
router.patch('/:id/routing/:order/complete', verifyToken, routingController.completeStep);
router.post('/:id/response', verifyToken, responseController.create);

module.exports = router;
