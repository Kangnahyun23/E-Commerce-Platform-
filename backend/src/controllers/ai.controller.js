const aiService = require('../services/ai.service');
const { sendSuccess, sendBadRequest } = require('../utils/response');

async function chat(req, res, next) {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== 'string' || !question.trim()) {
      return sendBadRequest(res, 'Vui lòng nhập câu hỏi');
    }
    const userId = req.user ? req.user.id : null;
    const data = await aiService.chat(question.trim(), userId);
    return sendSuccess(res, 'Thành công', data);
  } catch (err) {
    next(err);
  }
}

module.exports = { chat };
