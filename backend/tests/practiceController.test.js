const mongoose = require('mongoose');
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');
const app = require('../index');
const PracticeTask = require('../models/practiceModel');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Ensure we use a fresh connection for tests
    await mongoose.disconnect();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Practice Task Controller', () => {
    it('should create a new practice task', async () => {
        const response = await supertest(app)
            .post('/practiceTasks')
            .field('taskType', 'Write about the Photo')
            .field('explanation', 'This is a test explanation.')
            .attach('file', path.join(__dirname, 'testImage.jpg'));

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Practice Task Created!');
        expect(response.body.data).toHaveProperty('taskType', 'Write about the Photo');
        expect(response.body.data).toHaveProperty('imageUrl');
        expect(response.body.data).toHaveProperty('explanation', 'This is a test explanation.');

        // Clean up the uploaded file (if it was created)
        const filePath = path.join(__dirname, `../uploads/${response.body.data.imageUrl}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });

    it('should fetch all practice tasks', async () => {
        await new PracticeTask({
            taskType: 'Write about the Photo',
            imageUrl: 'testImage.jpg',
            explanation: 'This is a test explanation.'
        }).save();

        const response = await supertest(app).get('/practiceTasks');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Practice Tasks fetched successfully!');
        expect(response.body.tasks.length).toBeGreaterThan(0);
    });

    it('should delete a practice task', async () => {
        const task = await new PracticeTask({
            taskType: 'Write about the Photo',
            imageUrl: 'testImage.jpg',
            explanation: 'This is a test explanation.'
        }).save();

        const response = await supertest(app).delete(`/practiceTasks/${task._id}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Practice Task deleted successfully!');

        const deletedTask = await PracticeTask.findById(task._id);
        expect(deletedTask).toBeNull();

        // Ensure the file was deleted (if it was created)
        const filePath = path.join(__dirname, `../uploads/${task.imageUrl}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });
});
