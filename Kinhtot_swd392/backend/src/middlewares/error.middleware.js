const { sendError } = require('../utils/response');

function errorMiddleware(err, req, res, next) {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') return sendError(res, 'Kích thước file vượt quá 5MB', 400);
  if (err.message && err.message.includes('Chỉ chấp nhận ảnh')) return sendError(res, err.message, 400);
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ';
  return sendError(res, message, status);
}

module.exports = errorMiddleware;
