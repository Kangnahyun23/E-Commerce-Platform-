const productService = require('../services/product.service');
const { sendSuccess, sendCreated } = require('../utils/response');
const { uploadBufferToCloudinary } = require('../config/cloudinary');

async function list(req, res, next) {
  try {
    const data = await productService.getList(req.query);
    return sendSuccess(res, 'Thành công', data);
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const data = await productService.getBySlug(req.params.slug);
    return sendSuccess(res, 'Thành công', data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await productService.create(req.user.id, req.user.role, req.body);
    return sendCreated(res, 'Tạo sản phẩm thành công', data);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await productService.update(req.params.id, req.user.id, req.user.role, req.body);
    return sendSuccess(res, 'Cập nhật thành công', data);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const data = await productService.remove(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, 'Đã xóa', data);
  } catch (err) {
    next(err);
  }
}

async function uploadImage(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ status: 400, message: 'Thiếu file ảnh để upload (field: image)' });
    }

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'kinhtot/products',
      resource_type: 'image',
      overwrite: false,
      format: 'webp',
    });

    return sendCreated(res, 'Upload ảnh sản phẩm thành công', {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getBySlug, create, update, remove, uploadImage };
