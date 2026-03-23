const statsService = require('../services/stats.service');
const { sendSuccess } = require('../utils/response');

async function getHomeStats(req, res, next) {
  try {
    const data = await statsService.getHomeStats();
    return sendSuccess(res, 'Thanh cong', data);
  } catch (err) {
    next(err);
  }
}

async function getDashboard(req, res, next) {
  try {
    const { from, to } = req.query;
    const data = await statsService.getAdminStats({ startDate: from || null, endDate: to || null });
    return sendSuccess(res, 'Thanh cong', data);
  } catch (err) {
    next(err);
  }
}

async function getSellerDashboard(req, res, next) {
  try {
    const { range, tz } = req.query;
    const data = await statsService.getSellerStats({
      sellerId: req.user.id,
      range: range || '30d',
      tz: tz || 'Asia/Ho_Chi_Minh',
    });
    return sendSuccess(res, 'Thanh cong', data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getHomeStats, getDashboard, getSellerDashboard };
