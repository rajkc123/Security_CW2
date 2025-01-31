// logModel.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'register', // must match your user model name: mongoose.model('register', registerSchema)
        default: null,
    },
    action: {
        type: String,
        required: true,
    },
    details: {
        type: String,
    },
    ip: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Log', logSchema);
