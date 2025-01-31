const registerModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// LOGGING ADDED
const { logActivity } = require('../services/logger'); // import your logger utility

// SERVER-SIDE PASSWORD POLICY
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,16}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// LOCKOUT CONFIG
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

// ========== CREATE USER (REGISTER) ==========
const createUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "Please enter all fields" });
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be 8-16 chars, include uppercase, lowercase, number, and special character.",
        });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "The provided email is not valid",
        });
    }


    try {
        const existingUser = await registerModel.findOne({ email });
        if (existingUser) {
            // LOGGING ADDED: registration fail
            await logActivity({
                action: 'REGISTER_FAIL',
                details: `Email already in use`,
                ip: req.ip,
            });

            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const plainOTP = generateOTP();
        const hashedOTP = await bcrypt.hash(plainOTP, salt);

        const newUser = new registerModel({
            username,
            email,
            password: hashedPassword,
            isVerified: false,
            emailVerificationOTP: hashedOTP,
            otpExpiry: Date.now() + 10 * 60 * 1000,
            passwordLastUpdated: new Date(),
            passwordHistory: [
                {
                    passwordHash: hashedPassword,
                    changedAt: new Date(),
                },
            ],
        });

        await newUser.save();

        // LOGGING ADDED: registration success
        await logActivity({
            userId: newUser._id,
            action: 'REGISTER_SUCCESS',
            details: `Registered new user: ${username}`,
            ip: req.ip,
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Email Verification - Uplingoo',
            text: `Hello ${username},\n\nYour OTP code is ${plainOTP}.\nIt expires in 10 minutes.\n\nRegards,\nTeam Uplingoo`,
        };
        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            success: true,
            message: "User Successfully Created. Please check your email for the OTP.",
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ========== LOGIN USER (With Lockout + reCAPTCHA) ==========
const loginUser = async (req, res) => {
    const { email, password, captchaToken } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide email and password",
        });
    }

    if (!captchaToken) {
        return res.status(400).json({
            success: false,
            message: 'No reCAPTCHA token provided.',
        });
    }

    try {
        // reCAPTCHA verify
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captchaToken}`;
        const googleResponse = await fetch(verifyUrl, { method: 'POST' });
        const googleData = await googleResponse.json();
        if (!googleData.success) {
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA validation failed.',
            });
        }

        const user = await registerModel.findOne({ email });
        if (!user) {
            // LOGGING ADDED: login fail (unknown email)
            await logActivity({
                action: 'LOGIN_FAIL',
                details: `Email not found`,
                ip: req.ip,
            });
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // lockout checks ...
        const now = new Date();
        if (user.lockoutUntil && now < user.lockoutUntil) {
            const lockedUntilString = user.lockoutUntil.toLocaleString();

            // LOGGING ADDED: user tried to log in but is locked
            await logActivity({
                userId: user._id,
                action: 'LOGIN_FAIL_LOCKED',
                details: `User locked until ${lockedUntilString}`,
                ip: req.ip,
            });

            return res.status(403).json({
                success: false,
                message: `Account locked until ${lockedUntilString} due to multiple failed attempts.`,
            });
        } else if (user.lockoutUntil && now >= user.lockoutUntil) {
            user.loginAttempts = 0;
            user.lockoutUntil = null;
            await user.save();
        }

        if (!user.isVerified) {
            // LOGGING ADDED
            await logActivity({
                userId: user._id,
                action: 'LOGIN_FAIL_NOT_VERIFIED',
                details: 'User account not verified',
                ip: req.ip,
            });
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in.",
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            user.loginAttempts += 1;

            // LOGGING ADDED: password fail
            await logActivity({
                userId: user._id,
                action: 'LOGIN_FAIL_WRONG_PASSWORD',
                details: `Failed attempt #${user.loginAttempts}`,
                ip: req.ip,
            });

            if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                const lockoutUntil = new Date(now.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
                user.lockoutUntil = lockoutUntil;
                await user.save();

                // LOGGING ADDED: account lockout
                await logActivity({
                    userId: user._id,
                    action: 'ACCOUNT_LOCKOUT',
                    details: `Locked until ${lockoutUntil.toLocaleString()}`,
                    ip: req.ip,
                });

                return res.status(403).json({
                    success: false,
                    message: `Too many failed attempts. Account locked until ${lockoutUntil.toLocaleString()}.`,
                });
            }

            await user.save();
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        // success
        user.loginAttempts = 0;
        user.lockoutUntil = null;

        if (user.isPasswordExpired && user.isPasswordExpired(90)) {
            // LOGGING ADDED: password expired
            await logActivity({
                userId: user._id,
                action: 'LOGIN_FAIL_EXPIRED_PASSWORD',
                details: 'Password expired',
                ip: req.ip,
            });

            return res.status(403).json({
                success: false,
                message: "Password expired. Please change your password.",
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        if (!token) {
            throw new Error("JWT generation failed");
        }

        await user.save();

        // LOGGING ADDED: login success
        await logActivity({
            userId: user._id,
            action: 'LOGIN_SUCCESS',
            details: 'User logged in',
            ip: req.ip,
        });

        res.json({
            success: true,
            message: "Login successful",
            token: token,
            userData: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ========== VERIFY EMAIL (OTP) ==========
const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Please provide email and OTP.",
        });
    }

    try {
        const user = await registerModel.findOne({ email });
        if (!user) {
            // LOGGING ADDED
            await logActivity({
                action: 'VERIFY_EMAIL_FAIL_USER_NOT_FOUND',
                details: `Email: ${email}`,
                ip: req.ip,
            });
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isVerified) {
            await logActivity({
                userId: user._id,
                action: 'VERIFY_EMAIL_ALREADY_VERIFIED',
                details: 'User tried to verify again',
                ip: req.ip,
            });
            return res.status(400).json({
                success: false,
                message: "User is already verified.",
            });
        }

        if (Date.now() > user.otpExpiry) {
            await logActivity({
                userId: user._id,
                action: 'VERIFY_EMAIL_FAIL_EXPIRED',
                details: 'OTP expired',
                ip: req.ip,
            });
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please register again or request a new OTP.",
            });
        }

        const isMatch = await bcrypt.compare(otp, user.emailVerificationOTP);
        if (!isMatch) {
            await logActivity({
                userId: user._id,
                action: 'VERIFY_EMAIL_FAIL_WRONG_OTP',
                details: 'Wrong OTP entered',
                ip: req.ip,
            });
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }

        user.isVerified = true;
        user.emailVerificationOTP = null;
        user.otpExpiry = null;
        await user.save();

        // LOGGING ADDED: verify email success
        await logActivity({
            userId: user._id,
            action: 'VERIFY_EMAIL_SUCCESS',
            details: 'User verified their email',
            ip: req.ip,
        });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now log in.",
        });
    } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ========== RESEND OTP ==========
const resendOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {
        const user = await registerModel.findOne({ email });
        if (!user) {
            await logActivity({
                action: 'RESEND_OTP_FAIL_NOT_FOUND',
                details: `Email: ${email}`,
                ip: req.ip,
            });
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.isVerified) {
            await logActivity({
                userId: user._id,
                action: 'RESEND_OTP_FAIL_ALREADY_VERIFIED',
                ip: req.ip,
            });
            return res.status(400).json({ success: false, message: "User is already verified" });
        }

        const plainOTP = generateOTP();
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(plainOTP, salt);

        user.emailVerificationOTP = hashedOTP;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        // LOGGING ADDED
        await logActivity({
            userId: user._id,
            action: 'RESEND_OTP',
            details: 'Resent email verification code',
            ip: req.ip,
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Resend OTP - Uplingoo',
            text: `Your new OTP is ${plainOTP}. It expires in 10 minutes.`,
        };
        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: "New OTP sent to your email.",
        });
    } catch (error) {
        console.error("Error resending OTP:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ========== CHANGE PASSWORD (reuse & expiry) ==========
const changePassword = async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Please provide email, old password, and new password.",
        });
    }

    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            success: false,
            message: "New password must be 8-16 chars, include uppercase, lowercase, number, and special character.",
        });
    }

    try {
        const user = await registerModel.findOne({ email });
        if (!user) {
            await logActivity({
                action: 'CHANGE_PASSWORD_FAIL_NOT_FOUND',
                details: `Email: ${email}`,
                ip: req.ip,
            });
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            await logActivity({
                userId: user._id,
                action: 'CHANGE_PASSWORD_FAIL_WRONG_OLDPWD',
                ip: req.ip,
            });
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        for (let i = 0; i < user.passwordHistory.length; i++) {
            const oldHash = user.passwordHistory[i].passwordHash;
            const isReused = await bcrypt.compare(newPassword, oldHash);
            if (isReused) {
                await logActivity({
                    userId: user._id,
                    action: 'CHANGE_PASSWORD_FAIL_REUSE',
                    details: 'Tried to reuse old password',
                    ip: req.ip,
                });
                return res.status(400).json({
                    success: false,
                    message: "You cannot reuse a recently used password.",
                });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNew = await bcrypt.hash(newPassword, salt);

        user.password = hashedNew;
        user.passwordLastUpdated = new Date();
        user.passwordHistory.push({
            passwordHash: hashedNew,
            changedAt: new Date(),
        });
        if (user.passwordHistory.length > 5) {
            user.passwordHistory.shift();
        }

        await user.save();

        // LOGGING ADDED: password changed
        await logActivity({
            userId: user._id,
            action: 'CHANGE_PASSWORD_SUCCESS',
            details: 'User changed their password',
            ip: req.ip,
        });

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ========== REQUEST PASSWORD RESET ==========
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Please provide your email.",
        });
    }

    try {
        const user = await registerModel.findOne({ email });
        if (!user) {
            await logActivity({
                action: 'REQUEST_PWD_RESET_FAIL_NOT_FOUND',
                details: `Email: ${email}`,
                ip: req.ip,
            });
            return res.status(404).json({
                success: false,
                message: "No user found with that email.",
            });
        }

        const plainOTP = generateOTP();
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(plainOTP, salt);

        user.resetPasswordOTP = hashedOTP;
        user.resetPasswordOTPExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        // LOGGING ADDED
        await logActivity({
            userId: user._id,
            action: 'REQUEST_PWD_RESET',
            details: 'User requested password reset code',
            ip: req.ip,
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Password Reset - Uplingoo',
            text: `Your password reset code is: ${plainOTP}. It expires in 10 minutes.`,
        };
        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: "A reset code has been sent to your email.",
        });
    } catch (error) {
        console.error("Error requesting password reset:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ========== VERIFY PASSWORD RESET (SET NEW PASSWORD) ==========
const verifyPasswordReset = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Email, OTP, and new password are required.",
        });
    }

    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            success: false,
            message: "New password must be 8-16 chars, include uppercase, lowercase, number, and special character.",
        });
    }

    try {
        const user = await registerModel.findOne({ email });
        if (!user) {
            await logActivity({
                action: 'VERIFY_PWD_RESET_FAIL_NOT_FOUND',
                details: `Email: ${email}`,
                ip: req.ip,
            });
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.resetPasswordOTP || Date.now() > user.resetPasswordOTPExpiry) {
            await logActivity({
                userId: user._id,
                action: 'VERIFY_PWD_RESET_FAIL_EXPIRED',
                ip: req.ip,
            });
            return res.status(400).json({
                success: false,
                message: "Reset code has expired. Please request a new one.",
            });
        }

        const isMatch = await bcrypt.compare(otp, user.resetPasswordOTP);
        if (!isMatch) {
            await logActivity({
                userId: user._id,
                action: 'VERIFY_PWD_RESET_FAIL_WRONG_OTP',
                ip: req.ip,
            });
            return res.status(400).json({
                success: false,
                message: "Invalid reset code.",
            });
        }

        // All good, set new password
        const salt = await bcrypt.genSalt(10);
        const hashedNew = await bcrypt.hash(newPassword, salt);

        // Prevent reuse
        for (let i = 0; i < user.passwordHistory.length; i++) {
            const oldHash = user.passwordHistory[i].passwordHash;
            const isReused = await bcrypt.compare(newPassword, oldHash);
            if (isReused) {
                await logActivity({
                    userId: user._id,
                    action: 'VERIFY_PWD_RESET_FAIL_REUSE',
                    details: 'Tried to reuse old password on reset',
                    ip: req.ip,
                });
                return res.status(400).json({
                    success: false,
                    message: "You cannot reuse a recently used password.",
                });
            }
        }

        user.password = hashedNew;
        user.passwordLastUpdated = new Date();
        user.passwordHistory.push({
            passwordHash: hashedNew,
            changedAt: new Date(),
        });
        if (user.passwordHistory.length > 5) {
            user.passwordHistory.shift();
        }

        user.resetPasswordOTP = null;
        user.resetPasswordOTPExpiry = null;
        await user.save();

        // LOGGING ADDED
        await logActivity({
            userId: user._id,
            action: 'VERIFY_PWD_RESET_SUCCESS',
            details: 'User successfully reset password',
            ip: req.ip,
        });

        return res.json({
            success: true,
            message: "Password has been reset successfully. You can now log in with your new password.",
        });
    } catch (error) {
        console.error("Error verifying password reset:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    createUser,
    loginUser,
    verifyEmail,
    changePassword,
    resendOTP,
    requestPasswordReset,
    verifyPasswordReset,
};
