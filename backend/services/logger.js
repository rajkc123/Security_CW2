// logger.js
const Log = require('../models/logModel');

/**
 * logActivity
 * @param {Object} options
 * @param {String} [options.userId] - ID of the user performing the action (if known)
 * @param {String} options.action - Short string describing the action (e.g. "LOGIN_SUCCESS")
 * @param {String} [options.details] - More info about the action
 * @param {String} [options.ip] - IP address if available (req.ip)
 */
async function logActivity({ userId, action, details, ip }) {
    try {
        await Log.create({
            user: userId || null,
            action,
            details,
            ip,
        });
    } catch (err) {
        console.error('Error logging activity:', err);
    }
}

module.exports = {
    logActivity,
};
