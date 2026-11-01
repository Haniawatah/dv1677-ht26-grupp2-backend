import { connectToDatabase, db } from './db/database.mjs';
import { ObjectId } from 'mongodb';

const comments = {
    // Get all comments for a document, sorted by line and then by creation time
    getByDocument: async function getByDocument(documentId) {
        await connectToDatabase();
        return await db.collection("comments")
            .find({ documentId: new ObjectId(documentId) })
            .sort({ line: 1, createdAt: 1 })
            .toArray();
    },

    // Get a single comment by its own id
    getOne: async function getOne(id) {
        await connectToDatabase();
        return await db.collection("comments").findOne({ _id: new ObjectId(id) });
    },

    // Add a comment to a document
    addOne: async function addOne(body) {
        await connectToDatabase();
        const result = await db.collection("comments").insertOne({ ...body, documentId: new ObjectId(body.documentId) });
        return result;
    },

    // Delete a single comment by id
    deleteOne: async function deleteOne(id) {
        await connectToDatabase();
        const result = await db.collection("comments").deleteOne({ _id: new ObjectId(id) });
        return result;
    },

    // Delete all comments for a document (used when the document is removed)
    deleteByDocument: async function deleteByDocument(documentId) {
        await connectToDatabase();
        const result = await db.collection("comments").deleteMany({ documentId: new ObjectId(documentId) });
        return result;
    }
};

export default comments;