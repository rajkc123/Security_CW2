import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../apis/Api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './register.css';

// Password policy: 8-16 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,16}$/;

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Real-time feedback message
    const [passwordFeedback, setPasswordFeedback] = useState('');

    const navigate = useNavigate();

    // Check password strength in real-time
    const handlePasswordChange = (e) => {
        const newPass = e.target.value;
        setPassword(newPass);

        // Basic checks for user feedback
        if (newPass.length < 8) {
            setPasswordFeedback('Minimum length is 8 characters.');
        } else if (newPass.length > 16) {
            setPasswordFeedback('Maximum length is 16 characters.');
        } else if (!/[A-Z]/.test(newPass)) {
            setPasswordFeedback('Include at least one uppercase letter.');
        } else if (!/[a-z]/.test(newPass)) {
            setPasswordFeedback('Include at least one lowercase letter.');
        } else if (!/\d/.test(newPass)) {
            setPasswordFeedback('Include at least one digit.');
        } else if (!/[\W_]/.test(newPass)) {
            setPasswordFeedback('Include at least one special character.');
        } else {
            setPasswordFeedback('Strong password!');
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !email || !password || !confirmPassword) {
            toast.error('All fields are required');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        // Final check against the regex
        if (!passwordRegex.test(password)) {
            toast.error(
                'Password must be 8-16 chars and include uppercase, lowercase, digit, and special char.'
            );
            return;
        }

        try {
            const response = await registerUser({ username, email, password });
            if (response.data.success) {
                toast.success(response.data.message);
                // They must check email for OTP and then verify before logging in
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error("Error registering:", err.response ? err.response.data : err.message);
            toast.error(
                err.response
                    ? err.response.data.message
                    : 'Error registering. Please try again.'
            );
        }
    };

    return (
        <div className='background-img'>
            <img src="/background.jpg" alt="bg-image" className="bg-image" />

            <div className="register-container">
                <div className="register-logo">
                    <img src="/uplingoologo.png" alt="Logo" className="logo" />
                </div>
                <h2 className="header">Signup</h2>
                <form onSubmit={handleSubmit} className="form">
                    <div className="input-group">
                        <label htmlFor="username" className="label">
                            <i className="fas fa-user icon"></i>
                            <input
                                type="text"
                                id="username"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input"
                            />
                        </label>
                    </div>
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
                                type="password"
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={handlePasswordChange}
                                className="input"
                            />
                        </label>
                        {/* Real-time feedback */}
                        {password && (
                            <p
                                style={{
                                    color: passwordFeedback === 'Strong password!' ? 'green' : 'red',
                                    fontSize: '0.9rem',
                                    marginTop: '5px',
                                }}
                            >
                                {passwordFeedback}
                            </p>
                        )}
                    </div>
                    <div className="input-group">
                        <label htmlFor="confirmPassword" className="label">
                            <i className="fas fa-lock icon"></i>
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input"
                            />
                        </label>
                    </div>
                    <button type="submit" className="button">Signup</button>
                </form>
                <div className="login-link">
                    <a href="/" className="link">Already have an account? Login</a>
                </div>
            </div>
        </div>
    );
};

export default Register;
