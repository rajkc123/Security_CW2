const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const authenticateToken = require('../middleware/authMiddleware');  // Authentication check
const subscriptionCheck = require('../middleware/subscriptionCheck');  // Subscription check

// Public routes (e.g., for admin or testing if needed)
router.get('/', practiceController.getAllPracticeTasks);

// Protected routes (only accessible with valid subscription and authentication)
router.post('/', authenticateToken, subscriptionCheck, upload.single('image'), practiceController.createPracticeTask);
router.delete('/:id', authenticateToken, subscriptionCheck, practiceController.deletePracticeTask);

module.exports = router;
