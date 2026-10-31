import { connectToDatabase, db } from './db/database.mjs';
import { ObjectId } from 'mongodb';
import comments from './comments.mjs';

const docs = {
    getAll: async function getAll(owner) {
        await connectToDatabase();
        const documents = await db.collection("documents").find({ owner }).toArray();
        return documents;
    },
    getOne: async function getOne(id, owner) {
        await connectToDatabase();
        const document = await db.collection("documents").findOne({ _id: new ObjectId(id), owner });
        return document;
    },
    addOne: async function addOne(body, owner) {
        await connectToDatabase();
        const result = await db.collection("documents").insertOne({ ...body, owner });
        return result;
    },
    updateOne: async function updateOne(id, body, owner) {
        await connectToDatabase();
        const { title, content } = body;

        if (title && content) {
            const result = await db.collection("documents").updateOne(
            { _id: new ObjectId(id), owner },
            { $set: { "title": title, "content": content } }
            );
            return result;
        }

        if (!title && content) {
            const result = await db.collection("documents").updateOne(
            { _id: new ObjectId(id), owner },
            { $set: { "content": content } }
            );
            return result;
        }

        if (title && !content) {
            const result = await db.collection("documents").updateOne(
            { _id: new ObjectId(id), owner },
            { $set: { "title": title } }
            );
            return result;
        }
    },
    deleteOne: async function deleteOne(id, owner) {
        await connectToDatabase();
        const result = await db.collection("documents").deleteOne({ _id: new ObjectId(id), owner });

        // Clean up any comments that belonged to this document
        if (result.deletedCount > 0) {
            await comments.deleteByDocument(id);
        }

        return result;
    }
};

export default docs;

