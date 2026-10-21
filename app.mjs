import 'dotenv/config';
import express from 'express';
import apiRouter from './routes/api_routes.mjs';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

const app = express();

app.disable('x-powered-by');
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api", apiRouter);

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Middleware for att gå runt att express skickar en querry till mongoDB om favicon.ico
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // 204 = No Content
});

export default app;

