import axios from 'axios';

// Base URL for the API
const API_URL = 'http://localhost:5002/api/users';

// Function to register a new user
export const registerUser = async (userData) => {
    return await axios.post(`${API_URL}/register`, userData);
};

// Function to log in a user
// NOTE: We now expect userData to include { email, password, captchaToken }
export const loginUser = async (userData) => {
    return await axios.post(`${API_URL}/login`, userData);
};

// Function to verify email with OTP
export const verifyEmail = async (verificationData) => {
    return await axios.post(`${API_URL}/verifyEmail`, verificationData);
};

// (Other existing functions remain unchanged)...

export const addPricing = async (userData) => {
    return await axios.post(`${API_URL}/pricing`, userData);
};

export const addPracticeTask = async (formData) => {
    return await axios.post('http://localhost:5002/practiceTasks', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getPracticeTasks = async () => {
    return await axios.get('http://localhost:5002/practiceTasks');
};

export const deletePracticeTask = async (taskId) => {
    return await axios.delete(`http://localhost:5002/practiceTasks/${taskId}`);
};

export const addAudioQuestion = async (formData) => {
    return await axios.post('http://localhost:5002/audioQuestions', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getAudioQuestions = async () => {
    return await axios.get('http://localhost:5002/audioQuestions');
};

export const deleteAudioQuestion = async (taskId) => {
    return await axios.delete(`http://localhost:5002/audioQuestions/${taskId}`);
};

// Resend OTP
export const resendOTP = async (data) => {
    return axios.post('http://localhost:5002/api/users/resendOTP', data);
};


// requestPasswordReset
export const requestPasswordReset = async (data) => {
    // data = { email }
    return axios.post('http://localhost:5002/api/users/requestPasswordReset', data);
};

// verifyPasswordReset
export const verifyPasswordReset = async (data) => {
    // data = { email, otp, newPassword }
    return axios.post('http://localhost:5002/api/users/verifyPasswordReset', data);
};


// Create payment intent
export const upgradeSubscription = async (data) => {
    return await axios.post('http://localhost:5002/api/payment/create-payment-intent', data);
};


