// Load environment variables first
require('dotenv').config();

const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('Cloudinary Config Check:');
console.log('Cloud Name:', cloudName ? '✅ Set' : '❌ Missing');
console.log('API Key:', apiKey ? '✅ Set' : '❌ Missing');
console.log('API Secret:', apiSecret ? '✅ Set' : '❌ Missing');

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Cloudinary environment variables are not set properly");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

console.log('✅ Cloudinary configured successfully');
module.exports = cloudinary;