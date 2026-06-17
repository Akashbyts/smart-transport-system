const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(phone) {
  const otp = generateOTP();
  const redis = getRedisClient();
  const key = `otp:${phone}`;

  // Store OTP for 5 minutes
  await redis.setEx(key, 300, otp);

  if (process.env.OTP_PROVIDER === 'twilio') {
    // Twilio integration
    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await twilio.messages.create({
      body: `Your BusTrack OTP is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
  } else {
    // Mock mode for development
    logger.info(`[MOCK OTP] Phone: ${phone} | OTP: ${otp}`);
  }

  return true;
}

async function verifyOTP(phone, otp) {
  const redis = getRedisClient();
  const key = `otp:${phone}`;
  const storedOTP = await redis.get(key);

  if (!storedOTP) return { valid: false, message: 'OTP expired or not found' };
  if (storedOTP !== otp.toString()) return { valid: false, message: 'Invalid OTP' };

  await redis.del(key);
  return { valid: true };
}

module.exports = { sendOTP, verifyOTP };