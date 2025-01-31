const mongoose = require('mongoose');

const practiceTaskSchema = new mongoose.Schema({
    taskType: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const PracticeTask = mongoose.model('PracticeTask', practiceTaskSchema);

module.exports = PracticeTask;
