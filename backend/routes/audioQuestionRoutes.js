const express = require('express');
const router = express.Router();
const audioQuestionController = require('../controllers/audioQuestionController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Routes for audio questions
router.get('/', audioQuestionController.getAllAudioQuestions);
router.post('/', upload.single('audio'), audioQuestionController.createAudioQuestion);
router.delete('/:id', audioQuestionController.deleteAudioQuestion);

module.exports = router;
