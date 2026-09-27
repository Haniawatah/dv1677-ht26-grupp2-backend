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
        // const { title, content } = body;
        console.log(body);

        connectToDatabase();
        const result = await db.collection("documents").insertOne(body);
        // return result;
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
