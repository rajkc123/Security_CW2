const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    // Email verification
    isVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationOTP: {
        type: String, // We'll store a bcrypt-hashed OTP
    },
    otpExpiry: {
        type: Date, // Timestamp for OTP expiration
    },
    // Track old passwords to prevent reuse
    passwordHistory: [
        {
            passwordHash: { type: String },
            changedAt: { type: Date, default: Date.now },
        },
    ],
    // When was the current password last updated
    passwordLastUpdated: {
        type: Date,
        default: Date.now,
    },
    // =========================
    //   NEW FIELDS FOR LOCKOUT
    // =========================
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockoutUntil: {
        type: Date,
        default: null,
    },

    // ====== NEW FIELDS FOR FORGOT PASSWORD FLOW ======
    resetPasswordOTP: {
        type: String,
    },
    resetPasswordOTPExpiry: {
        type: Date,
    },
    // NEW FIELDS FOR SUBSCRIPTION STATUS
    subscriptionPlan: {
        type: String,
        enum: ['7-days', '15-days', null],
        default: null,
    },
    subscriptionExpiry: {
        type: Date,
        default: null,
    },
    
});

// OPTIONAL: Check password expiry (existing method)
registerSchema.methods.isPasswordExpired = function (maxAgeInDays = 90) {
    if (!this.passwordLastUpdated) return false;
    const now = new Date();
    const passwordAge = (now - this.passwordLastUpdated) / (1000 * 60 * 60 * 24);
    return passwordAge > maxAgeInDays;
};

const Register = mongoose.model('register', registerSchema);
module.exports = Register;
