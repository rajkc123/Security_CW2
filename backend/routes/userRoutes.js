const router = require('express').Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

// ========== Public Routes (No Token Required) ==========
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.post('/verifyEmail', userController.verifyEmail);
router.post('/resendOTP', userController.resendOTP);
router.post('/requestPasswordReset', userController.requestPasswordReset);
router.post('/verifyPasswordReset', userController.verifyPasswordReset);

// ========== Protected Route Example ==========
// "changePassword" now requires a valid JWT in the Authorization header
router.patch('/changePassword', authenticateToken, userController.changePassword);

module.exports = router;
