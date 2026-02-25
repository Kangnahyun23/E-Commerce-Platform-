const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { uploadProductImage } = require('../middlewares/upload.middleware');

router.get('/', productController.list);
router.post('/upload', authMiddleware, requireRole('SELLER', 'ADMIN', 'STAFF'), uploadProductImage, productController.uploadImage);
router.get('/:slug', productController.getBySlug);
router.post('/', authMiddleware, requireRole('SELLER', 'ADMIN', 'STAFF'), productController.create);
router.put('/:id', authMiddleware, requireRole('SELLER', 'ADMIN', 'STAFF'), productController.update);
router.delete('/:id', authMiddleware, requireRole('SELLER', 'ADMIN', 'STAFF'), productController.remove);

module.exports = router;
