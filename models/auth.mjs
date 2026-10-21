import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectToDatabase, db, closeDatabase } from "../db/database.mjs";
// import { ObjectId } from 'mongodb';

const auth = {
    register: async function(res, body) {
        const email = body.email;
        const password = body.password;

        const hash = await bcrypt.hash(password, 10);

        await connectToDatabase();
        await db.collection('users').insertOne({ email, password: hash });
        return res.status(201).json({
            data: {
                message: "User successfully registered."
            }
        });
    },

    login: async function(res, body) {
        const email = body.email;
        const password = body.password;
        const apiKey = body.api_key;

        const user = await db.collection('users').findOne({ email });
        const ok = user && await bcrypt.compare(password, user.password);

        if (!ok) {
        // Samma svar oavsett om e-posten eller lösenordet var fel —
        // annars avslöjar ni vilka e-postadresser som finns
            return res.status(401).json({ error: 'Fel e-post eller lösenord' })
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
            );

        res.json({ token })
    }
};

export default auth;