import 'dotenv/config';
import { MongoClient } from "mongodb";
import { existsSync, mkdirSync } from 'fs';

// Skapa db-mappen om den inte finns
if (!existsSync('./db')) {
    mkdirSync('./db');
}

const client = new MongoClient(process.env.MONGODB_URI);
let db;

// Koppla upp mot databasen
async function connectToDatabase() {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("Connected to MongoDB");
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

    try {
        await client.connect();
        db = client.db(process.env.DB_NAME);
        const collection = db.collection("documents");

        // Raderar innehållet i databasen och lägger till dbContent på nytt
        await collection.deleteMany({});
        await collection.insertMany(dbContent);
    } finally {
        await client.close();
    }
};

export { connectToDatabase, seed, db };
