const { v2: cloudinary } = require('cloudinary');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const hasCloudinaryConfig = Boolean(cloudName && apiKey && apiSecret);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

function uploadBufferToCloudinary(fileBuffer, options = {}) {
  if (!hasCloudinaryConfig) {
    throw Object.assign(new Error('Thiếu cấu hình Cloudinary. Vui lòng thiết lập CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'), { statusCode: 500 });
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
    stream.end(fileBuffer);
  });
}

module.exports = { cloudinary, uploadBufferToCloudinary, hasCloudinaryConfig };
