import express from "express";
import { ObjectId } from "mongodb";
import documents from "../docs.mjs";

const apiRouter = express.Router();

// GET /api/documents — return all documents
apiRouter.get("/documents", async (req, res) => {
    try {
        const data = await documents.getAll();
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/documents/:id — return a single document by its _id
apiRouter.get("/documents/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid document id" });
        }

        const data = await documents.getOne(id);

        if (!data) {
            return res.status(404).json({ error: "Document not found" });
        }

        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/documents — create a new document
apiRouter.post("/documents", async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }

        const result = await documents.addOne({ title, content });
        res.status(201).json({ data: { id: result.insertedId, title, content } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/documents/:id — update an existing document
apiRouter.put("/documents/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid document id" });
        }

        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }

        const result = await documents.updateOne(id, { title, content });

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Document not found" });
        }

        res.status(200).json({ data: { id, title, content } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/documents/:id — delete a document
apiRouter.delete("/documents/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid document id" });
        }

        const result = await documents.deleteOne(id);

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Document not found" });
        }

        res.status(200).json({ data: "Document deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default apiRouter;