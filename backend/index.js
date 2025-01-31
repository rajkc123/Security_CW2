require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./database/database');
const userRoutes = require('./routes/userRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const audioQuestionRoutes = require('./routes/audioQuestionRoutes');
const profileRoute = require('./routes/profileRoute');

const app = express();
connectDB();

// Basic security
app.use(helmet());
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(apiLimiter);

// CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/login', userRoutes); // Also covers /verifyEmail if you want, but typically we do /api/users
app.use('/api/users', userRoutes);
app.use('/practiceTasks', practiceRoutes);
app.use('/audioQuestions', audioQuestionRoutes);
app.use('/api/profile', profileRoute);

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
