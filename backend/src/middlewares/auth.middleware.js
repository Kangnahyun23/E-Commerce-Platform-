const { verify } = require('../utils/jwt');
const { sendUnauthorized } = require('../utils/response');
const prisma = require('../config/prisma');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Token không hợp lệ hoặc thiếu');
    }
    const token = authHeader.slice(7);
    const decoded = verify(token);
    if (!decoded || !decoded.userId) {
      return sendUnauthorized(res, 'Token không hợp lệ hoặc đã hết hạn');
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, fullName: true, role: true, phone: true, avatar: true },
    });
    if (!user) return sendUnauthorized(res, 'Người dùng không tồn tại');
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.slice(7);
    const decoded = verify(token);
    if (!decoded || !decoded.userId) return next();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, fullName: true, role: true, phone: true, avatar: true },
    });
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}

module.exports = { authMiddleware, optionalAuth };
