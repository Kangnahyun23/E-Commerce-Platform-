function sendResponse(res, status, message, data = null) {
  const body = { status, message };
  if (data !== null && data !== undefined) body.data = data;
  return res.status(status).json(body);
}

function sendSuccess(res, message = 'Success', data = null) {
  return sendResponse(res, 200, message, data);
}

function sendCreated(res, message = 'Created', data = null) {
  return sendResponse(res, 201, message, data);
}

function sendBadRequest(res, message = 'Bad request', data = null) {
  return sendResponse(res, 400, message, data);
}

function sendUnauthorized(res, message = 'Unauthorized') {
  return sendResponse(res, 401, message);
}

function sendForbidden(res, message = 'Forbidden') {
  return sendResponse(res, 403, message);
}

function sendNotFound(res, message = 'Not found') {
  return sendResponse(res, 404, message);
}

function sendError(res, message = 'Internal server error', status = 500) {
  return sendResponse(res, status, message);
}

module.exports = {
  sendResponse,
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendError,
};
