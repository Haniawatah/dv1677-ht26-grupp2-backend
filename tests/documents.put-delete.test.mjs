import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

let mongoServer;
let app;
let closeDatabase;
let documents;
let existingId;



beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.DB_NAME = 'testdb';

    const appModule = await import('../app.mjs');
    const dbModule = await import('../db/database.mjs');
    const docsModule = await import('../docs.mjs');

    app = appModule.default;
    closeDatabase = dbModule.closeDatabase;
    documents = docsModule.default;

    const result = await documents.addOne({
        title: 'Original title',
        content: 'Original content'
    });
    existingId = result.insertedId.toString();
});

afterAll(async () => {
    await closeDatabase();
    await mongoServer.stop();
});

describe('PUT /api/documents/:id', () => {
    it('updates an existing document', async () => {
        const response = await request(app)
            .put(`/api/documents/${existingId}`)
            .send({ title: 'Updated title', content: 'Updated content' });

        expect(response.status).toBe(200);
        expect(response.body.data.title).toBe('Updated title');
    });

    it('returns 404 when the document does not exist', async () => {
        const fakeId = '64b1f0f0f0f0f0f0f0f0f0f0';
        const response = await request(app)
            .put(`/api/documents/${fakeId}`)
            .send({ title: 'Does not matter', content: 'Does not matter' });

        expect(response.status).toBe(404);
    });
});

describe('DELETE /api/documents/:id', () => {
    it('deletes an existing document', async () => {
        const response = await request(app).delete(`/api/documents/${existingId}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
    });

    it('returns 404 when trying to delete the same document again', async () => {
        const response = await request(app).delete(`/api/documents/${existingId}`);

        expect(response.status).toBe(404);
    });
});
