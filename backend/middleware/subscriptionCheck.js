const User = require('../models/userModel');

const subscriptionCheck = async (req, res, next) => {
    try {
        // Find the user by their ID from the token
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the subscription plan and expiry date are valid
        const currentDate = new Date();
        if (!user.subscriptionPlan || !user.subscriptionExpiry || new Date(user.subscriptionExpiry) < currentDate) {
            return res.status(403).json({
                message: 'Access denied. You do not have an active subscription. Please upgrade your plan.',
            });
        }

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Subscription check failed:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = subscriptionCheck;
