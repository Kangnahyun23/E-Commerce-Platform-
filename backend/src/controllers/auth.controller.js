const authService = require('../services/auth.service');
const { uploadBufferToCloudinary } = require('../config/cloudinary');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateProfileUpdate,
} = require('../utils/validators');
const { sendCreated, sendSuccess } = require('../utils/response');

async function register(req, res, next) {
  try {
    const v = validateRegister(req.body);
    if (!v.ok) return res.status(400).json({ status: 400, message: v.message });
    const result = await authService.register(v.data);
    return sendCreated(res, 'Dang ky thanh cong', result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const v = validateLogin(req.body);
    if (!v.ok) return res.status(400).json({ status: 400, message: v.message });
    const result = await authService.login(v.data.email, v.data.password);
    return sendSuccess(res, 'Dang nhap thanh cong', result);
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const v = validateForgotPassword(req.body);
    if (!v.ok) return res.status(400).json({ status: 400, message: v.message });

    await authService.forgotPassword(v.data.email);
    return sendSuccess(res, 'Neu email ton tai, chung toi da gui huong dan dat lai mat khau.');
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const v = validateResetPassword(req.body);
    if (!v.ok) return res.status(400).json({ status: 400, message: v.message });

    await authService.resetPassword(v.data);
    return sendSuccess(res, 'Dat lai mat khau thanh cong');
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const data = await authService.getMe(req.user.id);
    return sendSuccess(res, 'Thanh cong', data);
  } catch (err) {
    next(err);
  }
}

async function uploadKYC(req, res, next) {
  try {
    const filePath = req.file ? req.file.path : null;
    const data = await authService.submitKYC(req.user.id, filePath, req.body);
    return sendSuccess(res, 'Gui KYC thanh cong. Trang thai: PENDING', data);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const v = validateProfileUpdate(req.body);
    if (!v.ok) return res.status(400).json({ status: 400, message: v.message });
    const data = await authService.updateProfile(req.user.id, v.data);
    return sendSuccess(res, 'Cap nhat thong tin ca nhan thanh cong', data);
  } catch (err) {
    next(err);
  }
}

async function uploadAvatar(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ status: 400, message: 'Thieu file avatar (field: avatar)' });
    }

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'kinhtot/avatars',
      resource_type: 'image',
      overwrite: false,
      format: 'webp',
    });

    return sendSuccess(res, 'Upload avatar thanh cong', {
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

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  uploadKYC,
  updateMe,
  uploadAvatar,
};
