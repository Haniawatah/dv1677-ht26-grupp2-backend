import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

let mongoServer;
let app;
let closeDatabase;
let documents;
let comments;
let token;
let otherToken;
let docId;
let otherCommentId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.DB_NAME = 'testdb';
    process.env.JWT_SECRET = 'test-secret';

    const appModule = await import('../app.mjs');
    const dbModule = await import('../db/database.mjs');
    const docsModule = await import('../docs.mjs');
    const commentsModule = await import('../comments.mjs');

    app = appModule.default;
    closeDatabase = dbModule.closeDatabase;
    documents = docsModule.default;
    comments = commentsModule.default;

    const regOwner = await request(app)
        .post('/api/auth/register')
        .send({ email: 'comment-owner@test.se', password: 'secret123' });
    token = regOwner.body.data.token;

    const regOther = await request(app)
        .post('/api/auth/register')
        .send({ email: 'other@test.se', password: 'secret123' });
    otherToken = regOther.body.data.token;

    const db = dbModule.db;
    const ownerUser = await db.collection('users').findOne({ email: 'comment-owner@test.se' });
    const otherUser = await db.collection('users').findOne({ email: 'other@test.se' });

    const result = await documents.addOne({
        title: 'Comment test doc',
        content: 'Line one\nLine two\nLine three'
    }, ownerUser._id.toString());
    docId = result.insertedId.toString();

    const seeded = await comments.addOne({
        documentId: docId,
        line: 2,
        text: 'Comment from other user',
        author: otherUser._id.toString(),
        authorEmail: 'other@test.se',
        createdAt: new Date().toISOString()
    });
    otherCommentId = seeded.insertedId.toString();
});

afterAll(async () => {
    await closeDatabase();
    await mongoServer.stop();
});

describe('Comments API (Krav 3)', () => {
    let myCommentId;

    it('returns 401 when no token is provided', async () => {
        const response = await request(app)
            .get(`/api/documents/${docId}/comments`);

        expect(response.status).toBe(401);
    });

    it('returns 201 when creating a comment', async () => {
        const response = await request(app)
            .post(`/api/documents/${docId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ line: 1, text: 'A test comment' });

        expect(response.status).toBe(201);
        expect(response.body.data.line).toBe(1);
        expect(response.body.data.text).toBe('A test comment');
        myCommentId = response.body.data.id;
    });

    it('returns 400 when line or text is invalid', async () => {
        const response = await request(app)
            .post(`/api/documents/${docId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ line: 0, text: '' });

        expect(response.status).toBe(400);
    });

    it('returns comments sorted by line number', async () => {
        const response = await request(app)
            .get(`/api/documents/${docId}/comments`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(2);
        expect(response.body.data[0].line).toBe(1);
        expect(response.body.data[1].line).toBe(2);
    });

    it('returns 404 when accessing comments on another user document', async () => {
        const response = await request(app)
            .get(`/api/documents/${docId}/comments`)
            .set('Authorization', `Bearer ${otherToken}`);

        expect(response.status).toBe(404);
    });

    it('returns 403 when trying to delete another user comment', async () => {
        const response = await request(app)
            .delete(`/api/documents/${docId}/comments/${otherCommentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
    });

    it('returns 200 when the author deletes their own comment', async () => {
        const response = await request(app)
            .delete(`/api/documents/${docId}/comments/${myCommentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
    });

    it('removes comments when the document is deleted', async () => {
        const delRes = await request(app)
            .delete(`/api/documents/${docId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(delRes.status).toBe(200);

        const remaining = await comments.getByDocument(docId);
        expect(remaining.length).toBe(0);
    });
});