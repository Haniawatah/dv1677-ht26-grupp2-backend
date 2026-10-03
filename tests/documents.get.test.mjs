import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';



let mongoServer;
let app;
let closeDatabase;
let existingId;



beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.DB_NAME = 'testdb';

    // Import after the env vars are set, so the app connects to the memory server.
    const appModule = await import('../app.mjs');
    const dbModule = await import('../db/database.mjs');
    const docsModule = await import('../docs.mjs');

    app = appModule.default;
    closeDatabase = dbModule.closeDatabase;

    const result = await docsModule.default.addOne({
        title: 'Test document',
        content: 'Some content for testing'
    });
    existingId = result.insertedId.toString();
});

afterAll(async () => {
    await closeDatabase();
    await mongoServer.stop();
});

describe('GET /api/documents', () => {
    it('returns all documents with status 200', async () => {
        const response = await request(app).get('/api/documents');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });
});


describe('GET /api/documents/:id', () => {
    it('returns the document when the id exists', async () => {
        const response = await request(app).get(`/api/documents/${existingId}`);

        expect(response.status).toBe(200);
        expect(response.body.data.title).toBe('Test document');
    });

    it('returns 404 when the id does not exist', async () => {
        const fakeId = '64b1f0f0f0f0f0f0f0f0f0f0';
        const response = await request(app).get(`/api/documents/${fakeId}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBeDefined();
    });

    it('returns 400 when the id is not a valid ObjectId', async () => {
        const response = await request(app).get('/api/documents/not-a-valid-id');

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    });
});
