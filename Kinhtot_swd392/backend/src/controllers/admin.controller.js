const adminService = require('../services/admin.service');
const { sendSuccess } = require('../utils/response');

async function listUsers(req, res, next) {
  try {
    const data = await adminService.listUsers(req.query);
    return sendSuccess(res, 'Thành công', data);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const data = await adminService.getUserById(req.params.id);
    return sendSuccess(res, 'Thành công', data);
  } catch (err) {
    next(err);
  }
}

async function updateUserById(req, res, next) {
  try {
    const data = await adminService.updateUserById(req.params.id, req.body, req.user.role);
    return sendSuccess(res, 'Cập nhật người dùng thành công', data);
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, getUserById, updateUserById };
