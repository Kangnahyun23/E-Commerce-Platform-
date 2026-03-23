const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/home', statsController.getHomeStats);
router.get('/seller', authMiddleware, requireRole('SELLER', 'ADMIN'), statsController.getSellerDashboard);

module.exports = router;
