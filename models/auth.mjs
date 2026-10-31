import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectToDatabase, db } from "../db/database.mjs";

const auth = {
    register: async function(res, body) {
        try {
            const email = body.email;
            const password = body.password;

            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }

            const normalizedEmail = email.trim().toLowerCase();

            await connectToDatabase();

            const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
            if (existingUser) {
                return res.status(409).json({ error: "Email is already registered" });
            }

            const hash = await bcrypt.hash(password, 10);
            const result = await db.collection('users').insertOne({ email: normalizedEmail, password: hash });

            const token = jwt.sign(
                { id: result.insertedId.toString(), email: normalizedEmail },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            return res.status(201).json({ data: { token } });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    login: async function(res, body) {
        try {
            const email = body.email;
            const password = body.password;

            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }

            const normalizedEmail = email.trim().toLowerCase();

            await connectToDatabase();

            const user = await db.collection('users').findOne({ email: normalizedEmail });
            const ok = user && await bcrypt.compare(password, user.password);

            if (!ok) {
                return res.status(401).json({ error: 'Wrong email or password' });
            }

            const token = jwt.sign(
                { id: user._id.toString(), email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            return res.status(200).json({ data: { token } });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};

export default auth;
