const path = require('path');
const PracticeTask = require('../models/practiceModel');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

const createPracticeTask = async (req, res) => {
    console.log('Received request to create practice task');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const { taskType, explanation } = req.body;

    if (!taskType || !explanation) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Image not found!"
        });
    }

    const { filename } = req.file;

    try {
        const newTask = new PracticeTask({
            taskType,
            imageUrl: filename,
            explanation
        });

        const task = await newTask.save();

        res.status(201).json({
            success: true,
            message: "Practice Task Created!",
            data: task
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

const deletePracticeTask = async (req, res) => {
    const { id } = req.params;
    try {
        const task = await PracticeTask.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }
        const imagePath = path.join(__dirname, `../uploads/${task.imageUrl}`);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Remove the image file if it exists
        } else {
            console.warn(`File not found: ${imagePath}`);
        }
        res.status(200).json({
            success: true,
            message: "Practice Task deleted successfully!"
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

const getAllPracticeTasks = async (req, res) => {
    console.log('Received request to get all practice tasks');
    try {
        const tasks = await PracticeTask.find({});
        res.status(200).json({
            success: true,
            message: "Practice Tasks fetched successfully!",
            tasks
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
    createPracticeTask,
    getAllPracticeTasks,
    deletePracticeTask
};
