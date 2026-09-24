import { connectToDatabase, db } from './db/database.mjs';
import { ObjectId } from 'mongodb';

const docs = {
    getAll: async function getAll() {
        connectToDatabase();
        let temp = await db.collection("documents").find().toArray();
        console.log(temp);
        return temp;
        // return await db.collection("documents").find().toArray();
        // return db.prepare('SELECT * FROM documents').all();
    },
    getOne: async function getOne(id) {
        connectToDatabase();
        console.log("före" + typeof(id));
        let temp = await db
            .collection("documents")
            .findOne({ _id: new ObjectId(id) });
        // console.log("efter" + typeof(_id));
        console.log(temp);
        return temp;
        // return await db.collection("documents").find({ _id: new ObjectId(id) }).toArray();
        // return db.prepare('SELECT * FROM documents WHERE id = ?').get(id) || {};
    },
    addOne: async function addOne(body) {
        const result = db.prepare(
            'INSERT INTO documents (title, content) VALUES (?, ?)'
        ).run(body.title, body.content);
        return { lastID: result.lastInsertRowid };
    },
    updateOne: async function updateOne(id, body) {
        const { title, content } = body;

        await db.collection("documents").updateOne(
            { _id: new ObjectId(id) },
            { $set: {title, content } }
        );
        // return db.prepare(
        //     'UPDATE documents SET title = ?, content = ? WHERE id = ?'
        // ).run(body.title, body.content, id);
    }
};

export default docs;
