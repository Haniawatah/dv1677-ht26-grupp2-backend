import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';



let mongoServer;
let app;
let closeDatabase;
let token;


beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.DB_NAME = 'testdb';
    process.env.JWT_SECRET = 'test-secret';

    const appModule = await import('../app.mjs');
    const dbModule = await import('../db/database.mjs');

    app = appModule.default;
    closeDatabase = dbModule.closeDatabase;

    const reg = await request(app)
        .post('/api/auth/register')
        .send({ email: 'post@test.se', password: 'secret123' });
    token = reg.body.data.token;
});

afterAll(async () => {
    await closeDatabase();
    await mongoServer.stop();
});

describe('POST /api/documents', () => {
    it('creates a new document and returns 201', async () => {
        const response = await request(app)
            .post('/api/documents')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'New document', content: 'New content' });

        expect(response.status).toBe(201);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.title).toBe('New document');
    });

    it('returns 400 when content is missing', async () => {
        const response = await request(app)
            .post('/api/documents')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Missing content' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    it('makes the created document available through GET afterwards', async () => {
        const createResponse = await request(app)
            .post('/api/documents')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Fetch me later', content: 'Some content' });

        const newId = createResponse.body.data.id;
        const getResponse = await request(app)
            .get(`/api/documents/${newId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.data.title).toBe('Fetch me later');
    });
});
