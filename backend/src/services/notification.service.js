const logger = require('../utils/logger');

/**
 * Notification Service
 * Currently supports: console logging (mock) + future Twilio / FCM integration
 * To enable real push notifications, configure FCM_SERVER_KEY in .env
 * To enable real SMS, configure TWILIO_* keys in .env
 */

// ─── SMS Notifications ────────────────────────────────────────────────────────

async function sendSMS(phone, message) {
  try {
    if (process.env.OTP_PROVIDER === 'twilio') {
      const twilio = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      const result = await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      logger.info(`SMS sent to ${phone} | SID: ${result.sid}`);
      return { success: true, sid: result.sid };
    } else {
      // Mock mode — log to console for development
      logger.info(`[MOCK SMS] To: ${phone} | Message: ${message}`);
      return { success: true, mock: true };
    }
  } catch (error) {
    logger.error(`SMS failed to ${phone}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ─── Push Notifications (FCM) ─────────────────────────────────────────────────

async function sendPushNotification(fcmToken, title, body, data = {}) {
  try {
    if (!process.env.FCM_SERVER_KEY) {
      logger.info(`[MOCK PUSH] Token: ${fcmToken} | Title: ${title} | Body: ${body}`);
      return { success: true, mock: true };
    }

    const axios = require('axios');
    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        to: fcmToken,
        notification: { title, body, sound: 'default' },
        data
      },
      {
        headers: {
          Authorization: `key=${process.env.FCM_SERVER_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`Push notification sent | Token: ${fcmToken.substring(0, 10)}...`);
    return { success: true, result: response.data };
  } catch (error) {
    logger.error(`Push notification failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function sendBulkPushNotifications(fcmTokens, title, body, data = {}) {
  if (!fcmTokens || fcmTokens.length === 0) return;

  if (!process.env.FCM_SERVER_KEY) {
    logger.info(`[MOCK BULK PUSH] Tokens: ${fcmTokens.length} | Title: ${title}`);
    return { success: true, mock: true };
  }

  try {
    const axios = require('axios');
    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        registration_ids: fcmTokens,
        notification: { title, body, sound: 'default' },
        data
      },
      {
        headers: {
          Authorization: `key=${process.env.FCM_SERVER_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`Bulk push sent to ${fcmTokens.length} devices`);
    return { success: true, result: response.data };
  } catch (error) {
    logger.error('Bulk push notification failed:', error.message);
    return { success: false, error: error.message };
  }
}

// ─── Specific Notification Triggers ──────────────────────────────────────────

async function notifyDriverApproved(driver) {
  const message =
    `Congratulations ${driver.name}! Your BusTrack driver account has been approved. ` +
    `You can now start accepting trips.`;

  return sendSMS(driver.phone, message);
}

async function notifyDriverRejected(driver, reason) {
  const message =
    `Hello ${driver.name}, your BusTrack driver application was not approved. ` +
    `Reason: ${reason}. Please contact support for assistance.`;

  return sendSMS(driver.phone, message);
}

async function notifyTripStarted(passengerFcmToken, busNumber, routeName) {
  return sendPushNotification(
    passengerFcmToken,
    'Your Bus is on the way!',
    `Bus ${busNumber} has started on route ${routeName}`,
    { type: 'TRIP_STARTED', busNumber, routeName }
  );
}

async function notifyDriverSuspended(driver, reason) {
  const message =
    `Hello ${driver.name}, your BusTrack account has been suspended. ` +
    `Reason: ${reason}. Contact support@bustracking.com`;

  return sendSMS(driver.phone, message);
}

async function notifyKYCSubmitted(adminPhone, driverName) {
  const message =
    `New KYC submission from driver ${driverName}. ` +
    `Please review and approve on the admin dashboard.`;

  return sendSMS(adminPhone, message);
}

module.exports = {
  sendSMS,
  sendPushNotification,
  sendBulkPushNotifications,
  notifyDriverApproved,
  notifyDriverRejected,
  notifyTripStarted,
  notifyDriverSuspended,
  notifyKYCSubmitted
};