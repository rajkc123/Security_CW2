const path = require('path');
const AudioQuestion = require('../models/audioQuestionModel');
const fs = require('fs');
const multer = require('multer');

// Multer setup for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create an audio question
const createAudioQuestion = async (req, res) => {
    console.log('Received request to create audio question');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const { taskType, explanation } = req.body;

    if (!taskType || !explanation) {
        return res.status(400).json({
            success: false,
            message: "Task type and explanation are required"
        });
    }

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Audio file not found!"
        });
    }

    const { filename } = req.file;

    try {
        const newQuestion = new AudioQuestion({
            taskType,
            audioUrl: filename,
            explanation
        });

        const question = await newQuestion.save();

        res.status(201).json({
            success: true,
            message: "Audio Question Created!",
            data: question
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error
        });
    }
};

// Delete an audio question
const deleteAudioQuestion = async (req, res) => {
    const { id } = req.params;
    try {
        const question = await AudioQuestion.findByIdAndDelete(id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }
        const audioPath = path.join(__dirname, `../uploads/${question.audioUrl}`);
        if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath); // Remove the audio file
        } else {
            console.warn(`File not found: ${audioPath}`);
        }
        res.status(200).json({
            success: true,
            message: "Audio Question deleted successfully!"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Get all audio questions
const getAllAudioQuestions = async (req, res) => {
    console.log('Received request to get all audio questions');
    try {
        const questions = await AudioQuestion.find({});
        res.status(200).json({
            success: true,
            message: "Audio Questions fetched successfully!",
            questions
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error
        });
    }
};

module.exports = {
    createAudioQuestion,
    getAllAudioQuestions,
    deleteAudioQuestion
};
