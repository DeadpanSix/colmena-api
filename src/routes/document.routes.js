const express = require('express');
const documentController = require('../controllers/document.controller');
const verifyToken = require('../middlewares/verifyToken');
const { upload, verifyAndSaveFile } = require('../middlewares/uploadDocument');

const router = express.Router();

router.get('/', verifyToken, documentController.list);
router.get('/:id', verifyToken, documentController.getById);
router.post('/', verifyToken, upload, verifyAndSaveFile, documentController.create);

module.exports = router;
