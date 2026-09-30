import 'dotenv/config';
import app from './app.mjs';
import { connectToDatabase, seed } from './db/database.mjs';

const port = process.env.PORT;

connectToDatabase().then(() => {
    app.listen(port, () => console.log(`App listening on port ${port}`));
});

seed();
