import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

let mongoServer;
let app;
let closeDatabase;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.DB_NAME = 'testdb';
    process.env.JWT_SECRET = 'test-secret';

    const appModule = await import('../app.mjs');
    const dbModule = await import('../db/database.mjs');

    app = appModule.default;
    closeDatabase = dbModule.closeDatabase;
});

afterAll(async () => {
    await closeDatabase();
    await mongoServer.stop();
});

describe('POST /api/auth/register', () => {
    it('registers a new user and returns a token', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ email: 'new@test.se', password: 'secret123' });

        expect(response.status).toBe(201);
        expect(response.body.data.token).toBeDefined();
    });

    it('normalizes the email (trim + lowercase)', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ email: '  MiXeD@test.se ', password: 'secret123' });

        expect(response.status).toBe(201);

        const { db } = await import('../db/database.mjs');
        const user = await db.collection('users').findOne({ email: 'mixed@test.se' });
        expect(user).not.toBeNull();
    });

    it('returns 400 when email or password is missing', async () => {
        const noEmail = await request(app)
            .post('/api/auth/register')
            .send({ password: 'secret123' });
        const noPassword = await request(app)
            .post('/api/auth/register')
            .send({ email: 'x@test.se' });

        expect(noEmail.status).toBe(400);
        expect(noPassword.status).toBe(400);
    });

    it('does not store the password in plain text', async () => {
        const { db } = await import('../db/database.mjs');
        const user = await db.collection('users').findOne({ email: 'new@test.se' });

        expect(user).not.toBeNull();
        expect(user.password).not.toBe('secret123');
    });
});

describe('POST /api/auth/login', () => {
    it('logs in a registered user and returns a token', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'new@test.se', password: 'secret123' });

        expect(response.status).toBe(200);
        expect(response.body.data.token).toBeDefined();
    });

    it('returns 401 for a wrong password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'new@test.se', password: 'wrong-password' });

        expect(response.status).toBe(401);
    });

    it('returns 401 for an unknown email', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'unknown@test.se', password: 'secret123' });

        expect(response.status).toBe(401);
    });

    it('returns 400 when email or password is missing', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'new@test.se' });

        expect(response.status).toBe(400);
    });
});

describe('Protected /api/documents routes', () => {
    it('returns 401 without a token', async () => {
        const response = await request(app).get('/api/documents');
        expect(response.status).toBe(401);
    });

    it('returns 401 with an invalid token', async () => {
        const response = await request(app)
            .get('/api/documents')
            .set('Authorization', 'Bearer not-a-real-token');
        expect(response.status).toBe(401);
    });

    it('returns 401 when the header is not Bearer formatted', async () => {
        const response = await request(app)
            .get('/api/documents')
            .set('Authorization', 'Token sometoken');
        expect(response.status).toBe(401);
    });
});

describe('Only own content', () => {
    it('does not let another user read, update or delete a document', async () => {
        // User A registers and creates a document
        const regA = await request(app)
            .post('/api/auth/register')
            .send({ email: 'owner@test.se', password: 'secret123' });
        const tokenA = regA.body.data.token;

        const createA = await request(app)
            .post('/api/documents')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ title: 'Document A', content: 'Content A' });
        const docId = createA.body.data.id;

        // breaking it down like this, user B registers and tries to reach A:s documents
        const regB = await request(app)
            .post('/api/auth/register')
            .send({ email: 'intruder@test.se', password: 'secret123' });
        const tokenB = regB.body.data.token;

        const getB = await request(app)
            .get(`/api/documents/${docId}`)
            .set('Authorization', `Bearer ${tokenB}`);
        expect(getB.status).toBe(404);

        const putB = await request(app)
            .put(`/api/documents/${docId}`)
            .set('Authorization', `Bearer ${tokenB}`)
            .send({ title: 'Stolen title', content: 'Stolen content' });
        expect(putB.status).toBe(404);

        const deleteB = await request(app)
            .delete(`/api/documents/${docId}`)
            .set('Authorization', `Bearer ${tokenB}`);
        expect(deleteB.status).toBe(404);

        // this might be still intact for the owner..
        const getA = await request(app)
            .get(`/api/documents/${docId}`)
            .set('Authorization', `Bearer ${tokenA}`);
        expect(getA.status).toBe(200);
        expect(getA.body.data.title).toBe('Document A');
    });

    it('shows each user only their own documents in the list', async () => {
        const regA = await request(app)
            .post('/api/auth/register')
            .send({ email: 'lista@test.se', password: 'secret123' });
        const tokenA = regA.body.data.token;

        const regB = await request(app)
            .post('/api/auth/register')
            .send({ email: 'listb@test.se', password: 'secret123' });
        const tokenB = regB.body.data.token;

        await request(app)
            .post('/api/documents')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ title: 'Only A', content: 'A' });
        await request(app)
            .post('/api/documents')
            .set('Authorization', `Bearer ${tokenB}`)
            .send({ title: 'Only B', content: 'B' });

        const listA = await request(app)
            .get('/api/documents')
            .set('Authorization', `Bearer ${tokenA}`);
        const titlesA = listA.body.data.map((doc) => doc.title);
        expect(titlesA).toContain('Only A');
        expect(titlesA).not.toContain('Only B');

        const listB = await request(app)
            .get('/api/documents')
            .set('Authorization', `Bearer ${tokenB}`);
        const titlesB = listB.body.data.map((doc) => doc.title);
        expect(titlesB).toContain('Only B');
        expect(titlesB).not.toContain('Only A');
    });
});

