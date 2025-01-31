const mongoose = require('mongoose');

const audioQuestionSchema = new mongoose.Schema({
    taskType: {
        type: String,
        required: true,
    },
    audioUrl: {
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

const AudioQuestion = mongoose.model('AudioQuestion', audioQuestionSchema);

module.exports = AudioQuestion;
