const express = require('express');
const departmentController = require('../controllers/department.controller');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.get('/', verifyToken, departmentController.list);
router.get('/:id', verifyToken, departmentController.getById);

router.post('/', verifyToken, requireRole('ADMIN'), departmentController.create);
router.put('/:id', verifyToken, requireRole('ADMIN'), departmentController.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'), departmentController.remove);

module.exports = router;
