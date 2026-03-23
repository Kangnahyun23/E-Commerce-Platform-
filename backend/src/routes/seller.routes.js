const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const sellerController = require('../controllers/seller.controller');

router.use(authMiddleware, requireRole('SELLER', 'ADMIN'));
router.get('/dashboard', statsController.getSellerDashboard);
router.put('/profile/address', sellerController.updateWarehouseAddress);

module.exports = router;
