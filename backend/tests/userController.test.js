const mongoose = require('mongoose');
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); // Ensure that your Express app is properly exported
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Create a new connection for testing
    await mongoose.disconnect(); // Disconnect any existing connections
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('User Controller', () => {

    //TEST1///////////////////////////////////
    it('should create a new user', async () => {
        const response = await supertest(app)
            .post('/api/users/register')
            .send({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('User Successfully Created');

        const user = await User.findOne({ email: 'testuser@example.com' });
        expect(user).not.toBeNull();
        expect(user.username).toBe('testuser');
    });
//TEST2///////////////////////////////////
    it('should not create a user with an existing email', async () => {
        // Create a user first
        await new User({
            username: 'testuser',
            email: 'existinguser@example.com',
            password: 'password123',
        }).save();

        const response = await supertest(app)
            .post('/api/users/register')
            .send({
                username: 'anotheruser',
                email: 'existinguser@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('User already exists');
    });
    //TEST3///////////////////////////////////

    it('should login a user with correct credentials', async () => {
        await new User({
            username: 'testuser',
            email: 'loginuser@example.com',
            password: await bcrypt.hash('password123', 10),
        }).save();

        const response = await supertest(app)
            .post('/api/users/login')
            .send({
                email: 'loginuser@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.token).toBeDefined();
    });
    //TEST4///////////////////////////////////

    it('should not login a user with incorrect password', async () => {
        await new User({
            username: 'testuser',
            email: 'incorrectpassword@example.com',
            password: await bcrypt.hash('password123', 10),
        }).save();

        const response = await supertest(app)
            .post('/api/users/login')
            .send({
                email: 'incorrectpassword@example.com',
                password: 'wrongpassword',
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid password');
    });
    
//TEST5/////////////////////////////////////////////////////
    it('should not login a non-existent user', async () => {
        const response = await supertest(app)
            .post('/api/users/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('User not found');
    });
});
