import db from './db/database.mjs';

const docs = {
    getAll: async function getAll() {
        return db.prepare('SELECT * FROM documents').all();
    },
    getOne: async function getOne(id) {
        return db.prepare('SELECT * FROM documents WHERE id = ?').get(id) || {};
    },
    addOne: async function addOne(body) {
        const result = db.prepare(
            'INSERT INTO documents (title, content) VALUES (?, ?)'
        ).run(body.title, body.content);
        return { lastID: result.lastInsertRowid };
    },
    updateOne: async function updateOne(id, body) {
        return db.prepare(
            'UPDATE documents SET title = ?, content = ? WHERE id = ?'
        ).run(body.title, body.content, id);
    }
};

export default docs;
