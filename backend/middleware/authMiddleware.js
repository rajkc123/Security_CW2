const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
};

const requireSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user && user.subscriptionExpiry > new Date()) {
            next(); // Subscription is active
        } else {
            res.status(403).json({ message: 'Subscription expired. Please upgrade to access this feature.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = authenticateToken,requireSubscription;
