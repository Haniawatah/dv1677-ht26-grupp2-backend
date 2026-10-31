import { connectToDatabase, db } from './db/database.mjs';
import { ObjectId } from 'mongodb';

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
    deleteOne: async function deleteOne(id, owner) {
        await connectToDatabase();
        const result = await db.collection("documents").deleteOne({ _id: new ObjectId(id), owner });
        return result;
    }
};

export default docs;

