import 'dotenv/config';
import app from './app.mjs';
import { connectToDatabase, seed } from './db/database.mjs';

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing. Set it in .env before starting the app.');
    process.exit(1);
}

const port = process.env.PORT;

connectToDatabase().then(() => {
    app.listen(port, () => console.log(`App listening on port ${port}`));
});

seed();
