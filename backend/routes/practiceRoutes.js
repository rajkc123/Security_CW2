const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', practiceController.getAllPracticeTasks);
router.post('/', upload.single('image'), practiceController.createPracticeTask);
router.delete('/:id', practiceController.deletePracticeTask);


module.exports = router;
