import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

// Import your API calls
import { loginUser, requestPasswordReset, resendOTP, verifyEmail, verifyPasswordReset } from '../../apis/Api';

// reCAPTCHA (unchanged)
import ReCAPTCHA from 'react-google-recaptcha';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [unverified, setUnverified] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOTP] = useState('');

    // ============== reCAPTCHA ==============
    const [captchaToken, setCaptchaToken] = useState('');
    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const navigate = useNavigate();

    // ============== FORGOT PASSWORD MODAL STATES ==============
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetStep, setResetStep] = useState(1); // Step 1 or 2
    const [resetEmail, setResetEmail] = useState('');
    const [resetOTP, setResetOTP] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Handle normal login
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!captchaToken) {
            toast.error('Please complete the reCAPTCHA before logging in.');
            return;
        }

        if (!email || !password) {
            toast.error('All fields are required');
            return;
        }

        try {
            const response = await loginUser({ email, password, captchaToken });
            if (response.data.success) {
                localStorage.setItem('userData', response.data.userData.username);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userData.id);


                toast.success('Login successful');
                setTimeout(() => {
                    navigate('/home');
                }, 1000);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            if (
                err.response?.status === 403 &&
                err.response?.data?.message === 'Please verify your email before logging in.'
            ) {
                toast.error('Your email is not verified. Click "Verify Email" below.');
                setUnverified(true);
            } else {
                const errorMsg = err.response?.data?.message || 'Error logging in. Please try again.';
                toast.error(errorMsg);
            }
        }
    };

    // Email Verification Modal logic (unchanged)
    const handleShowVerifyModal = () => {
        if (!email) {
            toast.error('Please enter your email first.');
            return;
        }
        setShowOTPModal(true);
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            toast.error('Please enter the OTP');
            return;
        }
        try {
            const response = await verifyEmail({ email, otp });
            if (response.data.success) {
                toast.success('Email verified successfully! You can now log in.');
                setShowOTPModal(false);
                setUnverified(false);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Error verifying OTP.';
            toast.error(errMsg);
        }
    };

    const handleResendOTP = async () => {
        if (!email) {
            toast.error('Please enter your email first.');
            return;
        }
        try {
            const response = await resendOTP({ email });
            if (response.data.success) {
                toast.success('A new OTP has been sent to your email.');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Error resending OTP.';
            toast.error(errMsg);
        }
    };

    // ============== FORGOT PASSWORD LOGIC ==============
    const handleShowForgotModal = () => {
        setShowForgotModal(true);
        setResetStep(1);
        setResetEmail('');
        setResetOTP('');
        setNewPassword('');
    };

    // Step 1: Request Password Reset
    const handleRequestReset = async () => {
        if (!resetEmail) {
            toast.error('Please enter your email');
            return;
        }
        try {
            const response = await requestPasswordReset({ email: resetEmail });
            if (response.data.success) {
                toast.success(response.data.message);
                // Move to step 2
                setResetStep(2);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Error requesting password reset.';
            toast.error(errMsg);
        }
    };

    // Step 2: Verify OTP & set new password
    const handleVerifyReset = async () => {
        if (!resetOTP || !newPassword) {
            toast.error('Please enter OTP and new password');
            return;
        }
        try {
            const response = await verifyPasswordReset({
                email: resetEmail,
                otp: resetOTP,
                newPassword,
            });
            if (response.data.success) {
                toast.success(response.data.message);
                // Close modal after success
                setShowForgotModal(false);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Error verifying password reset.';
            toast.error(errMsg);
        }
    };

    return (
        <div className="background">
            <img src="/background.jpg" alt="bg-image" className="bg-image" />

            <div className="login-container">
                <div className="login-logo">
                    <img src="/uplingoologo.png" alt="Logo" className="logo" />
                </div>
                <h2 className="header">Login</h2>
                <form onSubmit={handleSubmit} className="form">
                    <div className="input-group">
                        <label htmlFor="email" className="label">
                            <i className="fas fa-envelope icon"></i>
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                            />
                        </label>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password" className="label">
                            <i className="fas fa-lock icon"></i>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                            />
                            <span
                                className="eye-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'}></i>
                            </span>
                        </label>
                    </div>

                    {/* Google reCAPTCHA */}
                    <div style={{ margin: '10px 0' }}>
                        <ReCAPTCHA
                            sitekey="6Ldim8gqAAAAAMNhmYhs7kqk6wMAT4UOOt0fvFON"
                            onChange={handleCaptchaChange}
                        />
                    </div>

                    <button type="submit" className="button">Login</button>
                </form>

                {/* Verify Email if unverified */}
                {unverified && (
                    <div className="verify-email-link" style={{ marginTop: '10px' }}>
                        <button className="btn btn-primary" onClick={handleShowVerifyModal}>
                            Verify Email
                        </button>
                    </div>
                )}

                {/* Link to register */}
                <div className="signup-link" style={{ marginTop: '10px' }}>
                    <a href="/register" className="link">Don't have an account? Sign up</a>
                </div>

                {/* ============== NEW: FORGOT PASSWORD LINK ============== */}
                <div className="forgot-password" style={{ marginTop: '10px' }}>
                    <button
                        className="btn btn-link"
                        style={{ textDecoration: 'underline', color: '#007bff' }}
                        onClick={handleShowForgotModal}
                    >
                        Forgot Password?
                    </button>
                </div>
            </div>

            {/* ======================
          EMAIL VERIFY MODAL
         ====================== */}
            {showOTPModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowOTPModal(false)}>
                            &times;
                        </span>
                        <h2>Verify Your Email</h2>
                        <p>Enter the OTP sent to <b>{email}</b></p>
                        <div className="input-group" style={{ marginTop: '10px' }}>
                            <label htmlFor="otp" className="label">
                                <i className="fas fa-key icon"></i>
                                <input
                                    type="text"
                                    id="otp"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOTP(e.target.value)}
                                    className="input"
                                />
                            </label>
                        </div>

                        <button className="btn btn-success" style={{ marginTop: '10px' }} onClick={handleVerifyOTP}>
                            Verify
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ marginLeft: '10px', marginTop: '10px' }}
                            onClick={handleResendOTP}
                        >
                            Resend OTP
                        </button>
                    </div>
                </div>
            )}

            {/* ======================
          FORGOT PASSWORD MODAL
         ====================== */}
            {showForgotModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowForgotModal(false)}>
                            &times;
                        </span>

                        {resetStep === 1 && (
                            <>
                                <h3>Reset Password (Step 1)</h3>
                                <p>Enter your email to receive a reset code:</p>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    style={{ marginTop: '10px' }}
                                />
                                <button
                                    className="btn btn-primary"
                                    style={{ marginTop: '10px' }}
                                    onClick={handleRequestReset}
                                >
                                    Send Reset Code
                                </button>
                            </>
                        )}

                        {resetStep === 2 && (
                            <>
                                <h3>Reset Password (Step 2)</h3>
                                <p>Enter the reset code (OTP) from your email and a new password.</p>
                                <input
                                    type="text"
                                    placeholder="Reset Code (OTP)"
                                    value={resetOTP}
                                    onChange={(e) => setResetOTP(e.target.value)}
                                    style={{ marginTop: '10px' }}
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{ marginTop: '10px' }}
                                />
                                <button
                                    className="btn btn-success"
                                    style={{ marginTop: '10px' }}
                                    onClick={handleVerifyReset}
                                >
                                    Reset Password
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
