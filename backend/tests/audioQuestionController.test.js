const mongoose = require('mongoose');
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');
const app = require('../index');
const AudioQuestion = require('../models/audioQuestionModel');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.disconnect();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Audio Question Controller', () => {
    it('should create a new audio question', async () => {
        const response = await supertest(app)
            .post('/audioQuestions')
            .field('taskType', 'Listen and Type')
            .field('explanation', 'This is a test explanation for an audio question.')
            .attach('file', path.join(__dirname, 'testAudio.mp3'));

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Audio Question Created!');
        expect(response.body.data).toHaveProperty('taskType', 'Listen and Type');
        expect(response.body.data).toHaveProperty('audioUrl');
        expect(response.body.data).toHaveProperty('explanation', 'This is a test explanation for an audio question.');

        // Clean up the uploaded file (if it was created)
        const filePath = path.join(__dirname, `../uploads/${response.body.data.audioUrl}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });

    it('should fetch all audio questions', async () => {
        await new AudioQuestion({
            taskType: 'Listen and Type',
            audioUrl: 'testAudio.mp3',
            explanation: 'This is a test explanation for an audio question.'
        }).save();

        const response = await supertest(app).get('/audioQuestions');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Audio Questions fetched successfully!');
        expect(response.body.questions.length).toBeGreaterThan(0);
    });

    it('should delete an audio question', async () => {
        const question = await new AudioQuestion({
            taskType: 'Listen and Type',
            audioUrl: 'testAudio.mp3',
            explanation: 'This is a test explanation for an audio question.'
        }).save();

        const response = await supertest(app).delete(`/audioQuestions/${question._id}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Audio Question deleted successfully!');

        const deletedQuestion = await AudioQuestion.findById(question._id);
        expect(deletedQuestion).toBeNull();

        // Ensure the file was deleted (if it was created)
        const filePath = path.join(__dirname, `../uploads/${question.audioUrl}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });
});
