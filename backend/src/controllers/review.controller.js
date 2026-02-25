const reviewService = require('../services/review.service');
const { sendSuccess, sendCreated } = require('../utils/response');

async function list(req, res, next) {
  try {
    const data = await reviewService.list(req.query);
    return sendSuccess(res, 'Thành công', data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await reviewService.create(
      req.user.id,
      req.body.productId,
      req.body.rating,
      req.body.comment
    );
    return sendCreated(res, 'Tạo đánh giá thành công', data);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const data = await reviewService.remove(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, 'Xóa đánh giá thành công', data);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, remove };
