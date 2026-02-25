const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/', reviewController.list);
router.post('/', authMiddleware, requireRole('BUYER'), reviewController.create);
router.delete('/:id', authMiddleware, reviewController.remove);

module.exports = router;
