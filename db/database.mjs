import 'dotenv/config';
import { MongoClient } from "mongodb";

let client;
let db;

// Connect to the database, but only once. If we already have a
// connection we just reuse it instead of connecting again.
async function connectToDatabase() {
    if (db) {
        return db;
    }

    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("Connected to MongoDB");
    return db;
}

// Close the connection. Mostly used when tests are done running.
async function closeDatabase() {
    if (client) {
        await client.close();
        client = undefined;
        db = undefined;
    }
}

// Fyll databasen med dokument
async function seed() {
    const dbContent = [
        {
            "title": "Ett dokument",
            "content": "Det här är innehållet är ett innehåll i ett dokument."
        },
        {
            "title": "Handla mat",
            "content": "Kom ihåg att handla mjölk och träskruv."
        },
        {
            "title": "Mötesanteckningar",
            "content": "Mötet hölls den 1 september. Närvarande: Sven och ingen alls. Nytt möte varje onsdag 09:00-21:42."
        }
    ];

    await connectToDatabase();
    const collection = db.collection("documents");

    // Raderar innehållet i databasen och lägger till dbContent på nytt
    await collection.deleteMany({});
    await collection.insertMany(dbContent);
};

export { connectToDatabase, closeDatabase, seed, db };

