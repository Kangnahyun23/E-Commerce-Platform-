const { sendForbidden } = require('../utils/response');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return sendForbidden(res, 'Yêu cầu đăng nhập');
    if (!roles.includes(req.user.role)) {
      return sendForbidden(res, 'Bạn không có quyền thực hiện thao tác này');
    }
    next();
  };
}

module.exports = { requireRole };
