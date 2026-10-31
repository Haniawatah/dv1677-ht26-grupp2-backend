import express from "express";
import { ObjectId } from "mongodb";
import documents from "../docs.mjs";
import auth from "../models/auth.mjs";
import requireAuth from "../middleware/auth.mjs";

const apiRouter = express.Router();

// Require a valid JWT for all of the /api/documents routes
apiRouter.use("/documents", requireAuth);

// GET /api/documents return all documents belonging to the user
apiRouter.get("/documents", async (req, res) => {
    try {
        const data = await documents.getAll(req.user.id);
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/documents/:id return a single document by its _id
apiRouter.get("/documents/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid document id" });
        }

        const data = await documents.getOne(id, req.user.id);

        if (!data) {
            return res.status(404).json({ error: "Document not found" });
        }

        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/documents create a new document belonging to the user
apiRouter.post("/documents", async (req, res) => {
    try {
        const { title, content, type, createdAt, updatedAt } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: "Title, content and type are required" });
        }

        const result = await documents.addOne({ title, content, type, createdAt, updatedAt }, req.user.id);
        res.status(201).json({ data: { id: result.insertedId, title, content, type, createdAt, updatedAt } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/documents/:id  update an existing document owned by the user
apiRouter.put("/documents/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid document id" });
        }

        if (!content && !title) {
            return res.status(400).json({ error: "Title or content are required" });
        }

        const result = await documents.updateOne(id, { title, content }, req.user.id);

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Document not found" });
        }
        res.status(200).json({ data: { id, title, content } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETe /api/documents/:id delete a document owned by the userr
apiRouter.delete("/documents/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid document id" });
        }

        const result = await documents.deleteOne(id, req.user.id);

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Document not found" });
        }

        res.status(200).json({ data: "Document deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.post("/auth/register", (req, res) => {
    auth.register(res, req.body);
});

apiRouter.post("/auth/login", (req, res) => {
    auth.login(res, req.body);
});

export default apiRouter;