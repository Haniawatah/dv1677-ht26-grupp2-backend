import { connectToDatabase, db } from './db/database.mjs';
import { ObjectId } from 'mongodb';

const docs = {
    getAll: async function getAll() {
        connectToDatabase();
        let temp = await db.collection("documents").find().toArray();
        console.log(temp);
        return temp;
    },
    getOne: async function getOne(id) {
        connectToDatabase();
        let temp = await db.collection("documents").findOne({ _id: new ObjectId(id) });
        return temp;
    },
    addOne: async function addOne(body) {
        const result = db.prepare(
            'INSERT INTO documents (title, content) VALUES (?, ?)'
        ).run(body.title, body.content);
        return { lastID: result.lastInsertRowid };
    },
    updateOne: async function updateOne(id, body) {
        connectToDatabase();
        const { title, content } = body;

        await db.collection("documents").updateOne(
            { _id: new ObjectId(id) },
            { $set: { title, content } }
        );
    }
};

export default docs;
