import { connectToDatabase, db } from './db/database.mjs';
import { ObjectId } from 'mongodb';

const docs = {
    getAll: async function getAll() {
        await connectToDatabase();
        const documents = await db.collection("documents").find().toArray();
        return documents;
    },
    getOne: async function getOne(id) {
        await connectToDatabase();
        const document = await db.collection("documents").findOne({ _id: new ObjectId(id) });
        return document;
    },
    addOne: async function addOne(body) {
        await connectToDatabase();
        const result = await db.collection("documents").insertOne(body);
        return result;
    },
    updateOne: async function updateOne(id, body) {
        await connectToDatabase();
        const { title, content } = body;

        if (title && content) {
            const result = await db.collection("documents").updateOne(
            { _id: new ObjectId(id) },
            { $set: { "title": title, "content": content } }
            );
            return result;
        }

        if (!title && content) {
            const result = await db.collection("documents").updateOne(
            { _id: new ObjectId(id) },
            { $set: { "content": content } }
            );
            return result;
        }

        if (title && !content) {
            const result = await db.collection("documents").updateOne(
            { _id: new ObjectId(id) },
            { $set: { "title": title } }
            );
            return result;
        }



        // const result = await db.collection("documents").updateOne(
        //     { _id: new ObjectId(id) },
        //     { $set: { "title": title, "content": content } }
        // );
        // return result;
    },
    deleteOne: async function deleteOne(id) {
        await connectToDatabase();
        const result = await db.collection("documents").deleteOne({ _id: new ObjectId(id) });
        return result;
    }
};

export default docs;

