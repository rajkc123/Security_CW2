const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const authenticateToken = require('../middleware/authMiddleware');
const subscriptionCheck = require('../middleware/subscriptionCheck'); // Import the subscription check middleware
const bcrypt = require('bcryptjs');

// GET /api/profile
// GET /api/profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('username email subscriptionPlan subscriptionExpiry');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/check-subscription', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ active: false, message: 'User not found.' });
        }

        const currentDate = new Date();
        const expiryDate = new Date(user.subscriptionExpiry);

        if (expiryDate > currentDate) {
            return res.json({ active: true });
        } else {
            return res.json({ active: false, message: 'Subscription expired.' });
        }
    } catch (error) {
        console.error('Error checking subscription:', error);
        res.status(500).json({ active: false, message: 'Server error.' });
    }
});




// POST /api/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

   
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide both old and new passwords' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        if(oldPassword === newPassword) {
            return res.status(400).json({ message: 'Please use different password' });
        }
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
